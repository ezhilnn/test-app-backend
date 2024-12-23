const express = require('express');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const pool = require('../db');
const router = express.Router();

// Teacher creates a new quiz
router.post('/create', verifyToken, verifyRole(['teacher']), async (req, res) => {
  const { title } = req.body;
  // console.log(req.user)
  const teacherId = req.user.userId;
  // console.log(teacherId)

  try {
    const [result] = await pool.query('INSERT INTO quizzes (title, created_by) VALUES (?, ?)', [title, teacherId]);
    const quizId = result.insertId;
    res.status(201).json({ message: 'Quiz created successfully', quizId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error });
  }
});

// Teacher adds a question to a quiz
router.post('/add-question/:quizId', verifyToken, verifyRole(['teacher']), async (req, res) => {
  const { quizId } = req.params;
  const { question_text, options, correctOptionIndex } = req.body;

  try {
    const [result] = await pool.query('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)', [quizId, question_text]);
    const questionId = result.insertId;

    // Add options for the question
    for (let i = 0; i < options.length; i++) {
      const isCorrect = i === correctOptionIndex;
      await pool.query('INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)', [questionId, options[i], isCorrect]);
    }

    res.status(201).json({ message: 'Question added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding question', error });
  }
});

// View all quizzes (Admin)
router.get('/view-all', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const [quizzes] = await pool.query('SELECT * FROM quizzes');
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
});

// Teacher updates a question
router.put('/update-question/:questionId', verifyToken, verifyRole(['teacher']), async (req, res) => {
  const { questionId } = req.params;
  const { question_text, options, correctOptionIndex } = req.body;

  try {
    // Update the question text
    await pool.query('UPDATE questions SET question_text = ? WHERE id = ?', [question_text, questionId]);

    // Update options (delete old options and insert new ones)
    await pool.query('DELETE FROM answers WHERE question_id = ?', [questionId]);

    // Add new options
    for (let i = 0; i < options.length; i++) {
      const isCorrect = i === correctOptionIndex;
      await pool.query('INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)', [questionId, options[i], isCorrect]);
    }

    res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error });
  }
});

// Teacher deletes a question
router.delete('/delete-question/:questionId', verifyToken, verifyRole(['teacher']), async (req, res) => {
  const { questionId } = req.params;

  try {
    // Delete the question and associated answers
    await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);
    await pool.query('DELETE FROM answers WHERE question_id = ?', [questionId]);

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error });
  }
});

// Students fetch quiz to attempt
router.get('/:quizId', verifyToken, verifyRole(['student']), async (req, res) => {
  const { quizId } = req.params;

  try {
    const [questions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ?', [quizId]);
    const quizWithAnswers = [];

    for (const question of questions) {
      const [answers] = await pool.query('SELECT id, answer_text FROM answers WHERE question_id = ?', [question.id]);
      quizWithAnswers.push({
        question,
        answers,
      });
    }

    res.status(200).json({ quiz: quizWithAnswers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error });
  }
});

// Students submit their quiz attempt and store the result
router.post('/submit/:quizId', verifyToken, verifyRole(['student']), async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // { questionId: answerId }
  const studentId = req.user.id;

  try {
    let score = 0;
    let totalQuestions = 0;

    for (const questionId in answers) {
      totalQuestions++;
      const answerId = answers[questionId];
      const [correctAnswer] = await pool.query('SELECT is_correct FROM answers WHERE id = ?', [answerId]);

      if (correctAnswer[0]?.is_correct) {
        score++;
      }
    }

    const percentage = (score / totalQuestions) * 100;

    // Store the result
    await pool.query('INSERT INTO results (student_id, quiz_id, score, percentage) VALUES (?, ?, ?, ?)', [studentId, quizId, score, percentage]);

    res.status(200).json({ message: 'Quiz submitted successfully', score, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
});

module.exports = router;
