'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require('../../models/User');
const jwtAuth = require('../../lib/jwtAuth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('../../lib/validators');
const cors = require('cors');


/**
 * @api {post} /api/users/register Register an user
 * @apiName RegisterUser
 * @apiGroup User
 *
 * @apiParam {String} email User email (primary key).
 * @apiParam {String} password User password.
 * @apiParam {String} name User name.
 * 
 * @apiSuccess (Success 201) {String} status Status code.
 * @apiSuccess (Success 201) {String} resultDescription Success description.
 * @apiSuccess (Success 201) {Object} result User information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.post('/register', cors(), (req, res, next) => {
	let validationResult = validator.multipleValidations({ email: req.body.email, password: req.body.password, name: req.body.name });

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	User.find({ email: req.body.email }).exec()
		.then((values) => {
			let user
			// The email exists
			if (values.length > 0) {
				user = values[0]
				// If the email is active
				if (user.isActive) {
					res.json({ status: 403, resultDescription: 'The email exists. It can\'t be inserted', result: null });
				} else {
					// Reactivate the user
					user.lastReactivatedDate = new Date();
					user.isActive = true;
					User.update({ email: user.email }, user).exec()
						.then(() => {
							res.json({ status: 201, resultDescription: 'User reactivated', result: user });
						})
						.catch((err) => {
							next(err);
						});
				}
				return;
			} else {
				// Create an User document
				user = new User(req.body);
				user.password = bcrypt.hashSync(user.password, 10);
				user.creationDate = new Date();
				user.lastDeletedDate = null;
				user.lastModifiedDate = null;
				user.lastReactivatedDate = null;
				user.isActive = true;
				// Save the user
				user.save((err, savedUser) => {
					if (err) {
						next(err);
						return;
					}
					res.json({ status: 201, resultDescription: 'User registered', result: savedUser });
					return;
				});
			}
		})
		.catch((err) => {
			next(err);
			return;
		});
});

/**
 * @api {get} /api/users/authenticate?email&password Authenticate an user
 * @apiName AuthenticateUser
 * @apiGroup User
 *
 * @apiParam {String} email User email (primary key).
 * @apiParam {String} password User password.
 * 
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result User information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.get('/authenticate', cors(), (req, res, next) => {
	console.log('>>> /authenticate endpoint');
	let validationResult = validator.multipleValidations({ email: req.query.email, password: req.query.password });

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	User.find({ email: req.query.email }).exec()
		.then((values) => {
			switch (values.length) {
				case 0:
					res.json({ status: 404, resultDescription: 'Email not found', result: null });
					break;
				case 1:
					const user = values[0];
					if (!user.isActive) {
						res.json({ status: 403, resultDescription: 'Deleted user', result: null });
					} else {
						if (bcrypt.compareSync(req.query.password, user.password)) {
							let token = jwt.sign({ email: req.query.email }, validator.getSecretKey(), { expiresIn: '24h' });
							res.json({ status: 200, resultDescription: 'Token created', result: token });
						} else {
							res.json({ status: 403, resultDescription: 'Error authentication. Wrong password', result: null });
						}
					}
					break;
				default:
					res.json({ status: 403, resultDescription: 'More than one user', result: null });
					break;
			}
			return;
		})
		.catch((err) => {
			next(err);
			return;
		});
});

/**
 * @api {get} /api/users/all Get info from all users
 * @apiName AllUsersInfo
 * @apiGroup User
 * 
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result User information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.get('/all', function (req, res, next) {
	console.log('>>> Getting info from all users');
	User.find({}).exec()
		.then((users) => {
			switch (users.length) {
				case 0:
					res.json({ status: 404, resultDescription: 'No users found', result: null });
					break;
				default:
					res.json({ status: 200, resultDescription: 'All users info', result: users });
					break;
			}
		})
		.catch((err) => {
			next(err);
			return;
		});
});

/**
 * @api {get} /api/users?email&token Get user info
 * @apiName UserInfo
 * @apiGroup User
 *
 * @apiParam {String} token Token.
 * @apiParam {String} email User email (primary key).
 * 
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result User information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.get('/', cors(), jwtAuth(), function (req, res, next) {
	let validationResult = validator.multipleValidations({ email: req.query.email });

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	const email = req.query.email;
	const limit = parseInt(req.query.limit);
	const skip = parseInt(req.query.skip);
	const fields = req.query.fields;
	const sort = req.query.sort

	// An empty filter is created
	const filter = {};

	if (email) {
		filter.email = email;
	}

	User.list(filter, limit, skip, fields, sort, (err, users) => {
		if (err) {
			next(err);
			return;
		}

		if (users.length === 1) {
			res.json({ status: 200, resultDescription: 'User info', result: users[0] });
			return;
		} else {
			res.json({ status: 404, resultDescription: 'User ' + email + ' not found', result: null });
			return;
		}
	});
});

/**
 * @api {post} /api/users/delete Delete an user
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {String} token Token.
 * @apiParam {String} email User email (primary key).
 * 
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result User information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.post('/delete', cors(), jwtAuth(), (req, res, next) => {
	let validationResult = validator.multipleValidations({ email: req.body.email });

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	User.find({ email: req.body.email }).exec()
		.then((values) => {
			switch (values.length) {
				case 0:
					res.json({ status: 404, resultDescription: 'Email not found', result: null });
					break;
				case 1:
					// Deactivate isActive flag
					const user = values[0];

					if (user.isActive) {
						user.lastDeletedDate = new Date();
						user.isActive = false;
						// User.update({ email: req.body.email }, { lastDeletedDate: new Date(), isActive: false }).exec()
						User.update({ email: req.body.email }, user).exec()
							.then(() => {
								res.json({ status: 204, resultDescription: 'User deleted', result: user });
								return;
							})
							.catch((err) => {
								next(err);
								return;
							});
						break;
					} else {
						res.json({ status: 400, resultDescription: 'This user has already been deleted', result: null });
						return;
					}
				default:
					res.json({ status: 400, resultDescription: 'More than one user', result: null });
					break;
			}
			return;
		})
		.catch((err) => {
			next(err);
			return;
		});
});

/**
 * @api {post} /api/users/update Update an user
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {String} token Token.
 * @apiParam {String} email User email (primary key).
 * @apiParam {String} name Name.
 * 
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result User information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.post('/update', cors(), jwtAuth(), (req, res, next) => {
	let validationResult = validator.multipleValidations({ email: req.body.email, name: req.body.name });

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	User.find({ email: req.body.email }).exec()
		.then((users) => {
			switch (users.length) {
				case 0:
					res.json({ status: 404, resultDescription: 'Email not found', result: null });
					break;
				case 1:
					const user = users[0];
					if (!user.isActive) {
						res.json({ status: 403, resultDescription: 'Deleted user', result: null });
					} else {
						if (user.name === req.body.name) {
							res.json({ status: 403, resultDescription: 'The new name is the same as the old one', result: null });
						} else {
							// Modify the name
							user.name = req.body.name;
							user.lastModifiedDate = new Date();
							User.update({ email: req.body.email }, user).exec()
								.then(() => {
									res.json({ status: 200, resultDescription: '', result: user });
									return;
								})
								.catch((err) => {
									next(err);
									return;
								});
						}
					}
					break;
				default:
					res.json({ status: 400, resultDescription: 'More than one user', result: null });
					break;
			}
			return;
		})
		.catch((err) => {
			next(err);
			return;
		});
})

module.exports = router;
