"use strict";

const mongoose = require('mongoose');

// Primero definimos un esquema
const cmsTypeSchema = mongoose.Schema({
	idCmsType: Number,
	literal: String,
	creationDate: Date
});

cmsTypeSchema.index({idCmsType: 1});

// Luego creamos el modelo
var CmsType = mongoose.model('CmsType', cmsTypeSchema);

// Realmente no es necesario exportarlo, ya que en otros sitios podríamos recuperar el modelo usando:
// mongoose.model('CmsType')
module.exports = CmsType;