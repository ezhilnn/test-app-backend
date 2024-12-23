// // server/routes/auth.js

// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { createUser, findUserByEmail } = require('../models/userModel');
// const router = express.Router();

// // Register User
// router.post('/register', async (req, res) => {
//   const { name, email, password, role } = req.body;

//   try {
//     const existingUser = await findUserByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const passwordHash = await bcrypt.hash(password, 10);
//     await createUser(name, email, passwordHash, role);
//     res.status(201).json({ message: 'User created successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login User
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await findUserByEmail(email);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
// server/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Admins are assigned a department or the department is passed
    const userDepartment = role === 'admin' ? 'admin' : department;

    await createUser(name, email, passwordHash, role, userDepartment);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, department: user.department }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

