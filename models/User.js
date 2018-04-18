"use strict";

const mongoose = require('mongoose');

// Primero definimos un esquema
const userSchema = mongoose.Schema({
	email: String,
	name: String,
	password: String,
	creationDate: Date,
	lastDeletedDate: Date,
	lastModifiedDate: Date,
	lastReactivatedDate: Date,
	isActive: Boolean
});

userSchema.index({email: 1});

// Creamos un método estático
userSchema.statics.list = function(filter, limit, skip, fields, sort, callback) {
	const query = User.find(filter);
	query.limit(limit);
	query.skip(skip);
	query.select(fields); // {nombredecampo: 1, campoquenoquiero: 0}
	query.sort(sort);
	query.exec(callback);
};

// Luego creamos el modelo
var User = mongoose.model('User', userSchema);

// Realmente no es necesario exportarlo, ya que en otros sitios podríamos recuperar el modelo usando:
// mongoose.model('User')
module.exports = User;