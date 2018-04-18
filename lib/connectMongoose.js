"use strict"

const mongoose = require('mongoose');
const conn = mongoose.connection;

// Le decimos a mongoose que librería de promesas vamos a usar
mongoose.Promise = global.Promise;

conn.on('error', err => {
	console.log('Error de conexión', err);
	process.exit(1);
});

conn.once('open', () => {
	console.log('Conectado a MongoDB.');
});

if (process.env.ENVIRONMENT === 'dev') {
	mongoose.connect('mongodb://localhost/tryurapp');
	console.log('#######  MODO DESARROLLADOR #######');

} else {
	mongoose.connect('mongodb://mongo/tryurapp');
	console.log('#######  Produccion #######');
}

// No necesito exportar nada, ya que mongoose se quarda la conexión internamente