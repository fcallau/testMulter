'use strict';

const multer = require('multer');
const path = require('path');
const utilities = require('./utilities');
const Business = require('../models/Business');

function findName(req, file) {
  // console.log('>>> MULTER. req.files:', req.files);
  // console.log('>>> file:', file);
  // return utilities.getFilename(business._id, 'logo', contentType);
  // console.log('>>> req.body.imageType:', req.body.imageType);
  console.log('req.file:', req.file);
  console.log('file:', file);

  /*Business.find({ url: req.body.url }).exec()
    .then((values) => {
      switch (values.length) {
        case 0:
          res.json({ status: 404, resultDescription: 'url not found', result: null });
          break;
        default:
          // Create a Business object
          const business = values[0];

          return utilities.getFilename(business._id, req.body.imageType, contentType);*/

					/*let fileParts;
					let contentType;

					fileParts = path.extname(req.file.originalname).split('.');
					contentType = fileParts[fileParts.length - 1];
          // business.logoDataName = utilities.getFilename(business._id, req.body.imageType, contentType);
          business.logoDataName = utilities.getFilename(business._id, req.body.imageType, req.file.originalname);

          break;
      }
      return;
    })
    .catch((err) => {
      res.json({ status: 400, resultDescription: 'Error saving settings: ' + err.result, result: null });
      return;
    });*/

  // return utilities.getFilename(business._id, req.body.imageType, contentType);

  return 'newFilename';
}

// Multer upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    cb(null, findName(req, file));
  }
});

// const storage = multer.memoryStorage();

module.exports = multer({ storage: storage });