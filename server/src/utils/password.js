const bcrypt = require('bcryptjs');

const hashPassword = (value) => bcrypt.hash(value, 10);
const comparePassword = (value, hash) => bcrypt.compare(value, hash);
const hashPasswordSync = (value) => bcrypt.hashSync(value, 10);
const comparePasswordSync = (value, hash) => bcrypt.compareSync(value, hash);

module.exports = {
  hashPassword,
  comparePassword,
  hashPasswordSync,
  comparePasswordSync
};