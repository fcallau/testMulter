"use strict";

const mongoose = require('mongoose');

// Primero definimos un esquema
const businessTypeSchema = mongoose.Schema({
	idBusinessType: Number,
	literal: String,
	creationDate: Date
});

businessTypeSchema.index({idBusinessType: 1});

// Luego creamos el modelo
var BusinessType = mongoose.model('BusinessType', businessTypeSchema);

// Realmente no es necesario exportarlo, ya que en otros sitios podríamos recuperar el modelo usando:
// mongoose.model('BusinessType')
module.exports = BusinessType;