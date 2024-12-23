// server/models/userModel.js

// const db = require('../db');

// const createUser = async (name, email, passwordHash, role) => {
//   const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
//   return db.execute(sql, [name, email, passwordHash, role]);
// };

// const findUserByEmail = async (email) => {
//   const sql = 'SELECT * FROM users WHERE email = ?';
//   const [rows] = await db.execute(sql, [email]);
//   return rows[0];
// };

// module.exports = { createUser, findUserByEmail };
// server/models/userModel.js

const db = require('../db');

const createUser = async (name, email, passwordHash, role, department) => {
  const sql = 'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)';
  return db.execute(sql, [name, email, passwordHash, role, department]);
};

const findUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.execute(sql, [email]);
  return rows[0];
};

const findUsersByDepartment = async (department) => {
  const sql = 'SELECT id, name, email, role, department FROM users WHERE department = ?';
  const [rows] = await db.execute(sql, [department]);
  return rows;
};

module.exports = { createUser, findUserByEmail, findUsersByDepartment };
