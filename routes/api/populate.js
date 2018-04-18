"use strict";

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const BusinessType = require('../../models/BusinessType');
const CmsType = require('../../models/CmsType');
const constants = require('../../lib/constants');

function removeBusinessTypes() {
	return (new Promise((resolve, reject) => {
		// Delete businessTypes
		BusinessType.remove((err) => {
			if (err) {
				reject({ succes: false, result: 'Error removing BussinesTypes. Error: ' + err });
			} else {
				resolve({ succes: true, result: 'BusinessTypes removed' });
			}
		})
	}))
}

function removeCmsTypes() {
	return (new Promise((resolve, reject) => {
		// Delete cmsTypes
		CmsType.remove((err) => {
			if (err) {
				reject({ succes: false, result: 'Error removing CmsTypes. Error: ' + err });
			} else {
				resolve({ succes: true, result: 'CmsTypes removed' });
			}
		})
	}))
}

async function saveBusinessTypes() {
	let businessSaved = [];

	await removeBusinessTypes()
		.then((value) => {
			console.log(value.result);
		});

	await BusinessType.insertMany(constants.businessTypes)
		.then((documents) => {
			console.log('BusinessTypes saved');
			businessSaved = documents;
		});

	return businessSaved;
}

async function saveCmsTypes() {
	let cmsSaved = [];

	await removeCmsTypes()
		.then((value) => {
			console.log(value.result);
		});

	await CmsType.insertMany(constants.cmsTypes)
		.then((documents) => {
			console.log('CmsTypes saved');
			cmsSaved = documents;
		});

	return cmsSaved;
}

// GET /
router.get('/', (req, res, next) => {
	saveBusinessTypes()
		.then(saveCmsTypes()
		.then(() => {
			res.json({ status: 201, result: 'Initial data saved on Database' });
			return;
		}))
		.catch((err) => {
			console.log('Error saving in DataBase:', err);
			process.exit(1);
		})
});

module.exports = router;