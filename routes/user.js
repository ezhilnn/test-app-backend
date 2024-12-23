const express = require('express');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware'); // Your auth middleware
const pool = require('../db'); // Assuming your MySQL database connection is set up here
const router = express.Router();

// Get User Profile (Logged-in User)
// router.get('/profile', verifyToken, async (req, res) => {
//   const userId = req.user.id; // Get user ID from the token

//   try {
//     const [user] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);

//     if (user.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ user: user[0] });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching user profile', error });
//   }
// });
// router.get('/profile', verifyToken, async (req, res) => {
//     try {
//       // Assuming you're using the `userId` from the decoded token
//       const [user] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.userId]);
      
//       if (user.length === 0) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       res.status(200).json({ profile: user[0] });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error', error });
//     }
//   });
  router.get('/profile', verifyToken, async (req, res) => {
    try {
      const [user] = await pool.query('SELECT id, name, email, role, department FROM users WHERE id = ?', [req.user.userId]);
      
      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ profile: user[0] });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  router.get('/department/:department', verifyToken, verifyRole(['admin', 'teacher']), async (req, res) => {
    const { department } = req.params;
  
    try {
      const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE department = ?', [department]);
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users by department', error });
    }
  });
  
  
// Add New User (Admin Only)
router.post('/add', verifyToken, verifyRole(['admin']), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Get All Users (Admin Only)
router.get('/all', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role,department FROM users');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Update User Details (Admin Only)
// router.put('/update/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
//   const { id } = req.params;
//   const { name, email, password, role } = req.body;

//   try {
//     // Check if the user exists
//     const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
//     if (existingUser.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update user details
//     await pool.query(
//       'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
//       [name, email, password, role, id]
//     );

//     res.status(200).json({ message: 'User updated successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating user', error });
//   }
// });
router.put('/update/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, department } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ?, role = ?, department = ? WHERE id = ?',
      [name, email, password, role, department, id]
    );

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});


// Delete User (Admin Only)
router.delete('/delete/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the user exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

module.exports = router;
