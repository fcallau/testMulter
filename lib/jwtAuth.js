'use strict';

const jwt = require('jsonwebtoken');
const myJson = require('./secrets.json');

module.exports = function () {
	return function (req, res, next) {
		console.log('req.file:', req.file);
		const token = req.body.token || req.query.token || req.get('x-access-token');

		if (!token) {
			const err = new Error('No token provided');
			next(err);
			return;
		}

		// Verify JWT token
		jwt.verify(token, myJson.key, (err) => {
			if (err) {
				next(err);
				return;
			}

			// Token is valid
			next();
		});
	}
}