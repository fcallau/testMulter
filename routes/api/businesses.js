'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwtAuth = require('../../lib/jwtAuth');
const path = require('path');
const Business = require('../../models/Business');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const validator = require('../../lib/validators');
const upload = require('../../lib/uploadConfig');
const constants = require('../../lib/constants');
const utilities = require('../../lib/utilities');

/*function acceptedExtensionsForBothImageFiles(imageFiles) {
	let validationResult; // example: { success: true, result: 'Some message' }

	validationResult = { success: true, result: 'Successful validation. Accepted extensions for both image files' };;

	if (imageFiles.length !== 2) {
		validationResult = { success: false, result: 'Two images are needed; the first for the logo and the second for the welcome image' };
	} else {
		let fileParts;
		let fileExtension;

		for (var i = 0; i < imageFiles.length; i++) {
			let imageFile = imageFiles[i];

			fileParts = path.extname(imageFile.originalname).split('.');
			fileExtension = fileParts[fileParts.length - 1];

			if (constants.imageExtensionsAccepted.indexOf(fileExtension) < 0) {
				validationResult = { success: false, result: fileExtension + ' is not accepted like an image file extension' };
				break;
			}
		}
	}

	return validationResult
}*/

// router.post('/uploadimage', upload.single('myLogo'), (req, res, next) => {
/*router.post('/uploadimage', upload.array('myImages'), (req, res, next) => {
	// console.log('>>> req.file:', req.file);
	// console.log('>>> req.files:', req.files);
	// console.log('>>> req.body:', req.body);

	let images = req.files;

	let validationResult = acceptedExtensionsForBothImageFiles(images);

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	} else {
		res.json({ status: 200, resultDescription: validationResult.result, result: null });
		return;
	}

	res.json({ status: 200, resultDescription: 'uploadimage endpoint', result: null })
	return;
});*/

// Middleware for token validation
/*router.get('/*', (req, res, next) => {
	validateToken(req.query.token, res, next);
});

router.post('/*', (req, res, next) => {
	validateToken(req.body.token, res, next);
});*/

/**
 * @api {post} /api/businesses/create Create a business
 * @apiName CreateBusiness
 * @apiGroup Business
 *
 * @apiParam {String} token Token.
 * @apiParam {String} userEmail User email.
 * @apiParam {String} url Business url (primary key).
 * @apiParam {String} businessUser Business user (primary key).
 * @apiParam {String} businessName Business name (primary key).
 * @apiParam {Number} idBusinessType Business type.
 * @apiParam {Number} idCmsType Cms type.
 *
 * @apiSuccess (Success 201) {String} status Status code.
 * @apiSuccess (Success 201) {String} resultDescription Success description.
 * @apiSuccess (Success 201) {Object} result Business information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */

async function createBusiness(req) {
	// Asynchronous validations
	let idBusinessTypeIsValid = await validator.idBusinessTypeIsValid(req.body.idBusinessType);
	let idCmsTypeIsValid = await validator.idCmsTypeIsValid(req.body.idCmsType);
	let resultUserIsValid = await validator.userIsValid(req.body.userEmail);
	let resultBusinessCanBeCreated = await validator.businessCanBeCreated(req.body.url, req.body.businessUser, req.body.businessName);
}

router.post('/create', jwtAuth(), (req, res, next) => {
	let objectToValidate = {
		userEmail: req.body.userEmail,
		url: req.body.url,
		businessUser: req.body.businessUser,
		businessName: req.body.businessName
	};

	let validationResult = validator.multipleValidations(objectToValidate);

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	createBusiness(req)
		.then(() => {
			// Create a Business object
			const business = new Business(req.body);

			business.logoDataName = null;
			business.logoContentType = null;
			business.welcomeImageDataName = null;
			business.welcomeImageContentType = null;
			business.idLoadingType = 1;
			business.idAppIcon = 2;
			business.firstColorIdentifier = 6;
			business.secondColorIdentifier = 7;
			business.thirdColorIdentifier = 8;
			business.idFont = 7;
			business.isValidInfo = false;

			// Save the business
			business.save()
				.then((savedBusiness) => {
					res.json({ status: 201, resultDescription: 'Business created', result: savedBusiness });
					return;
				})
				.catch((err) => {
					next(err);
					return;
				});
		})
		.catch((err) => {
			res.json({ status: 400, resultDescription: 'Error validating if business can be create: ' + err.result, result: null });
			return;
		});
});

/**
 * @api {post} /api/businesses/savesettings Save business settings
 * @apiName SaveSettings
 * @apiGroup Business
 *
 * @apiParam {String} token Token.
 * @apiParam {String} url Business url.
 * @apiParam {Array} images First occurrence: logo. Second occurrence: welcome image.
 * @apiParam {Number} idLoadingType Loading type ID.
 * @apiParam {Number} idAppIcon App icon ID.
 * @apiParam {Number} firstColorIdentifier First color identifier.
 * @apiParam {Number} secondColorIdentifier Second color identifier.
 * @apiParam {Number} thirdColorIdentifier Third color identifier.
 * @apiParam {Number} idFont Font ID.
 *
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result Business information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.post('/savesettings', jwtAuth(), (req, res, next) => {
	let objectToValidate = {
		url: req.body.url,
		images: req.files,
		idLoadingType: req.body.idLoadingType,
		idAppIcon: req.body.idAppIcon,
		firstColorIdentifier: req.body.firstColorIdentifier,
		secondColorIdentifier: req.body.secondColorIdentifier,
		thirdColorIdentifier: req.body.thirdColorIdentifier,
		idFont: req.body.idFont
	};

	let validationResult = validator.multipleValidations(objectToValidate);

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	Business.find({ url: req.body.url }).exec()
		.then((values) => {
			switch (values.length) {
				case 0:
					res.json({ status: 404, resultDescription: 'url not found', result: null });
					break;
				default:
					// Create a Business object
					const business = values[0];

					let fileParts;
					let contentType;

					fileParts = path.extname(req.files[0].originalname).split('.');
					contentType = fileParts[fileParts.length - 1];
					business.logoDataName = utilities.getFilename(business._id, 'logo', contentType);
					console.log('>>> business.logoDataName:', business.logoDataName);
					// fileParts = path.extname(req.files[0].originalname).split('.');
					business.logoContentType = contentType;

					// business.welcomeImageData = req.files[1].buffer;
					// business.welcomeImageDataUrl = utilities.getFilename('otraURL');
					// fileParts = path.extname(req.files[1].originalname).split('.');
					// business.welcomeImageContentType = fileParts[fileParts.length - 1];

					business.idLoadingType = req.body.idLoadingType;
					business.idAppIcon = req.body.idAppIcon;
					business.firstColorIdentifier = req.body.firstColorIdentifier;
					business.secondColorIdentifier = req.body.secondColorIdentifier;
					business.thirdColorIdentifier = req.body.thirdColorIdentifier;
					business.idFont = req.body.idFont;

					// Update the business
					Business.update({ url: req.body.url }, business, (err, raw) => {
						if (err) {
							next(err);
						}
					}).exec()
						.then((value) => {
							res.json({ status: 200, resultDescription: 'Business settings saved', result: business });
						})
						.catch((err) => {
							next(err);
						});
					break;
			}
			return;
		})
		.catch((err) => {
			res.json({ status: 400, resultDescription: 'Error saving settings: ' + err.result, result: null });
			return;
		});
});

/**
 * @api {post} /api/businesses/uploadImage Upload an image
 * @apiDescription Use multipart/form-data
 * @apiName UploadImage
 * @apiGroup Business
 *
 * @apiParam {String} token Token.
 * @apiParam {String} url Business url.
 * @apiParam {String} imageType Image type ('logo' or 'welcomeImage').
 * @apiParam {Image} image Image.
 *
 * @apiSuccess {String} status Status code.
 * @apiSuccess {String} resultDescription Success description.
 * @apiSuccess {Object} result Business information.
 * @apiError {String} status Status code.
 * @apiError {String} resultDescription Error description.
 * @apiError {Object} result Error information.
 */
router.post('/uploadImage', upload.single('image'), jwtAuth(), (req, res, next) => {
	let objectToValidate = {
		url: req.body.url,
		imageType: req.body.imageType,
		image: req.file
	};

	let validationResult = validator.multipleValidations(objectToValidate);

	if (!validationResult.success) {
		res.json({ status: 400, resultDescription: validationResult.result, result: null });
		return;
	}

	Business.find({ url: req.body.url }).exec()
		.then((values) => {
			switch (values.length) {
				case 0:
					res.json({ status: 404, resultDescription: 'url not found', result: null });
					break;
				default:
					// Create a Business object
					const business = values[0];

					/*let fileParts;
					let contentType;

					fileParts = path.extname(req.file.originalname).split('.');
					contentType = fileParts[fileParts.length - 1];*/
					// business.logoDataName = utilities.getFilename(business._id, req.body.imageType, contentType);
					business.logoDataName = utilities.getFilename(business._id, req.body.imageType, req.file.originalname);
					console.log('>>> business.logoDataName:', business.logoDataName);
					// fileParts = path.extname(req.files[0].originalname).split('.');
					// business.logoContentType = contentType;

					// business.welcomeImageData = req.files[1].buffer;
					// business.welcomeImageDataUrl = utilities.getFilename('otraURL');
					// fileParts = path.extname(req.files[1].originalname).split('.');
					// business.welcomeImageContentType = fileParts[fileParts.length - 1];

					// Update the business
					Business.update({ url: req.body.url }, business, (err, raw) => {
						if (err) {
							next(err);
						}
					}).exec()
						.then((value) => {
							res.json({ status: 200, resultDescription: 'Business settings saved', result: business });
						})
						.catch((err) => {
							next(err);
						});
					break;
			}
			return;
		})
		.catch((err) => {
			res.json({ status: 400, resultDescription: 'Error saving settings: ' + err.result, result: null });
			return;
		});
});

module.exports = router;