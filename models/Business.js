"use strict";

const mongoose = require('mongoose');

// Primero definimos un esquema
const businessSchema = mongoose.Schema({
	userEmail: String,
	url: String,
	businessUser: String,
	businessName: String,
	idBusinessType: Number,
	idCmsType: String,
	logoDataName: String,
	logoContentType: String,
	welcomeImageDataName: String,
	welcomeImageContentType: String,
	idLoadingType: Number,
	idAppIcon: Number,
	firstColorIdentifier: Number,
	secondColorIdentifier: Number,
	thirdColorIdentifier: Number,
	idFont: Number,
	isValidInfo: Boolean
});

businessSchema.index({url: 1, user: 1, password: 1});

// Luego creamos el modelo
var business = mongoose.model('business', businessSchema);

// Realmente no es necesario exportarlo, ya que en otros sitios podríamos recuperar el modelo usando:
// mongoose.model('business')
module.exports = business;