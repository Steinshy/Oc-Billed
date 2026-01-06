const bcrypt = require("bcrypt");

const saltRounds = 10;

const hash = (value) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(value, saltRounds, (error, hashValue) => {
      if (error) reject(error);
      resolve(hashValue);
    });
  });

const compare = (value, hashValue) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(value, hashValue, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });

module.exports = {
  hash,
  compare,
};
