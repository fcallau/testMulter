'use strict';

const path = require('path');

// function getFilename(baseName, sufix, contentType) {
function getFilename(baseName, sufix, originalName) {
	let fileParts;
	let contentType;

	fileParts = path.extname(req.file.originalName).split('.');
	contentType = fileParts[fileParts.length - 1];

	return baseName + '_' + sufix + '.' + contentType;
}

module.exports = {
	getFilename
}