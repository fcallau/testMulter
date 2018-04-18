"use strict"

const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const emailValidator = require('email-validator');
const myJson = require('./secrets.json');
const validUrl = require('valid-url');
const User = require('../models/User');
const Business = require('../models/Business');
const BusinessType = require('../models/BusinessType');
const CmsType = require('../models/CmsType');
const constants = require('./constants');
const path = require('path');

// Create a schema 
var schema = new passwordValidator();

// Add properties to it 
schema
	.is().min(8)                                    // Minimum length 8
// .is().max(100)                                  // Maximum length 100
// .has().uppercase()                              // Must have uppercase letters
// .has().lowercase()                              // Must have lowercase letters
// .has().digits()                                 // Must have digits
// .has().not().spaces();                          // Should not have spaces

function getSecretKey() {
	return myJson.key;
}

function emailIsValid(key, email) {
	let good = { success: true, result: 'The ' + key + ' is valid' },
		bad = { success: false, result: 'The ' + key + ' is not valid' };
	return emailValidator.validate(email) ? good : bad;
}

function nameIsValid(key, name) {
	let good = { success: true, result: 'The ' + key + ' is valid' },
		bad = { success: false, result: key + ' too short. Must be at least 3 character' };
	return name.length >= 3 ? good : bad;
}

function passwordIsValid(password) {
	return !schema.validate(password) ? { success: false, result: schema.validate(password, { list: true }) } : { success: true, result: 'The password is valid' };
}

function urlIsValid(url) {
	let good = { success: true, result: 'The URL is valid' },
		bad = { success: false, result: 'The URL is not a secure URI' };
	return validUrl.isHttpsUri(url) ? good : bad;
}

/*function acceptedExtensionsForBothImageFiles(imageFiles) {
	let validationResult = { success: true, result: 'Successful validation. Accepted extensions for both image files' };

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

	return validationResult;
}*/

function acceptedExtensionForImageFile(imageFile) {
	let fileParts = path.extname(imageFile.originalname).split('.');
	let fileExtension = fileParts[fileParts.length - 1];

	let good = { success: true, result: 'Successful validation. Accepted extension for image file' },
		bad = { success: false, result: fileExtension + ' is not accepted like an image file extension' };
	return constants.imageExtensionsAccepted.indexOf(fileExtension) > -1 ? good : bad;
}

function acceptedImageTypeForImageFile(imageType) {
	let good = { success: true, result: 'Successful validation. Accepted image type for image file' },
		bad = { success: false, result: imageType + ' is not accepted like an image type' };
	return constants.imageTypesAccepted.indexOf(imageType) > -1 ? good : bad;
}

function idBusinessTypeIsValid(id) {
	return new Promise((resolve, reject) => {
		BusinessType.find({ idBusinessType: id }).exec()
			.then((values) => {
				switch (values.length) {
					case 0:
						reject({ success: false, result: 'idBusinessType ' + id + ' not found' });
						break;
					case 1:
						resolve({ success: true, result: 'idBusinessType ' + id + ' exists' });
						break;
					default:
						reject({ success: false, result: 'idBusinessType ' + id + ' exists more than once' });
						break;
				}
			})
			.catch((err) => {
				reject({ success: false, result: err });
			});
	});
}

function idCmsTypeIsValid(id) {
	return new Promise((resolve, reject) => {
		console.log('>>> idCmsTypeIsValid function');
		CmsType.find({ idCmsType: id }).exec()
			.then((values) => {
				console.log('>>> values.length:', values.length);
				switch (values.length) {
					case 0:
						reject({ success: false, result: 'idCmsType ' + id + ' not found' });
						break;
					case 1:
						resolve({ success: true, result: 'idCmsType ' + id + ' exists' });
						break;
					default:
						reject({ success: false, result: 'idCmsType ' + id + ' exists more than once' });
						break;
				}
			})
			.catch((err) => {
				reject({ success: false, result: err });
			});
	});
}

function userIsValid(email) {
	return new Promise((resolve, reject) => {
		User.find({ email: email }).exec()
			.then((values) => {
				switch (values.length) {
					case 0:
						reject({ success: false, result: 'User email ' + email + ' not found' });
						break;
					case 1:
						const user = values[0];
						if (!user.isActive) {
							reject({ success: false, result: 'Deleted user' });
						} else {
							console.log('>>> User is valid');
							resolve({ success: true, result: 'User is valid' });
							// resolve(req);
						}
						break;
					default:
						reject({ success: false, result: 'More than one user' });
						break;
				}
			})
			.catch((err) => {
				reject({ success: false, result: 'Error in \'userIsValid\' executing \'find\' function. Error: ' + err });
			});
	});
}

function businessCanBeCreated(url, businessUser, businessName) {
	return new Promise((resolve, reject) => {
		Business.find({ url: url, businessUser: businessUser, businessName: businessName }).exec()
			.then((values) => {
				switch (values.length) {
					case 0:
						resolve({ success: true, result: 'Business can be created' });
						break;
					default:
						reject({ success: false, result: 'url / businessUser / businessName exists. It can\'t be created' });
						break;
				}
			})
			.catch((err) => {
				reject({ success: false, result: 'Error in \'businessCanBeCreated\' executing \'find\' function. Error: ' + err });
			});
	});
}

function multipleValidations(objectToValidate) {
	// console.log('>>> multipleValidations function. objectToValidate:', objectToValidate);

	// Check that there are key/value pairs to validate
	if (Object.keys(objectToValidate).length === 0) {
		return { success: false, result: 'No key/value pairs to validate' };
	}

	let validationResult;

	// Each of the key/value pairs is validated
	for (var key in objectToValidate) {
		// console.log('key to validate:', key);
		let value = objectToValidate[key];

		// If there is a value associated with the key
		if (value) {
			// console.log('Value associated with the key ' + key + ' is:', value);

			switch (key) {
				case 'email':
				case 'userEmail':
					validationResult = emailIsValid(key, value);
					break;
				case 'password':
					validationResult = passwordIsValid(value);
					if (!validationResult.success) {
						validationResult.result = 'Password must be at least 8 characters';
					}
					break;
				case 'name':
				case 'businessUser':
				case 'businessName':
					validationResult = nameIsValid(key, value);
					break;
				case 'url':
					validationResult = urlIsValid(value);
					break;
				case 'image':
					validationResult = acceptedExtensionForImageFile(value);
					break;
				case 'imageType':
					validationResult = acceptedImageTypeForImageFile(value);
					break;
				// Pending validation criteria
				case 'idLoadingType':
				case 'idAppIcon':
				case 'firstColorIdentifier':
				case 'secondColorIdentifier':
				case 'thirdColorIdentifier':
				case 'idFont':
					break;
				default:
					// console.log('I don\'t to know validate the ' + key + ' key');
					validationResult = { success: false, result: 'I don\'t know to validate the ' + key + ' key' };
					break;
			}

			if (!validationResult.success) {
				return validationResult;
			}
		} else {
			return { success: false, result: 'No value associated with the ' + key + ' key' };
		}
	}

	return { success: true, result: 'Successful validations' };
}

module.exports = {
	getSecretKey,
	idBusinessTypeIsValid,
	idCmsTypeIsValid,
	userIsValid,
	businessCanBeCreated,
	multipleValidations
}