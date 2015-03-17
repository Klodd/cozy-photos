// Generated by CoffeeScript 1.9.1
var File, Photo, async, convertImage, createThumb, onThumbCreation, percent, thumb, thumb_files, total_files;

Photo = require('../models/photo');

File = require('../models/file');

thumb = require('./thumb').create;

async = require('async');

onThumbCreation = false;

percent = null;

total_files = 0;

thumb_files = 0;

module.exports.onThumbCreation = function() {
  return [thumb_files !== total_files, (thumb_files / total_files) * 100];
};

convertImage = function(cb) {
  var convert;
  convert = function(doc, callback) {
    var error;
    if (doc._attachments != null) {
      try {
        console.log("Convert " + doc.title + " ...");
        return doc.convertBinary(function(err, res, body) {
          if (err != null) {
            console.log(err);
          }
          return callback(err);
        });
      } catch (_error) {
        error = _error;
        console.log("Cannot convert " + doc.title);
        return callback();
      }
    } else {
      return callback();
    }
  };
  return Photo.all(function(err, docs) {
    if (err) {
      return cb(err);
    } else {
      return async.eachSeries(docs, convert, cb);
    }
  });
};

createThumb = function(socket, cb) {
  return File.withoutThumb(function(err, files) {
    if (err) {
      return cb(err);
    } else if (files != null) {
      total_files = files.length;
      return async.eachSeries(files, function(file, callback) {
        return thumb(file, function(err) {
          if (err) {
            console.log(err);
          }
          thumb_files += 1;
          percent = Math.floor((thumb_files / total_files) * 100);
          socket.emit('progress', {
            "percent": percent
          });
          return setTimeout(callback, 200);
        });
      }, cb);
    } else {
      return cb();
    }
  });
};

module.exports.convert = function(socket, done) {
  if (done == null) {
    done = function() {
      return null;
    };
  }
  onThumbCreation = true;
  return createThumb(socket, function() {
    onThumbCreation = false;
    return done();
  });
};
