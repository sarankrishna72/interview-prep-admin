const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const questionController = require('../controllers/questionController');

router.get('/', authMiddleware, questionController.getQuestion);
router.get('/new', authMiddleware, questionController.newQuestionPage);
router.get('/edit/:id', authMiddleware, questionController.editQuestionPage);
router.put('/edit/:id', authMiddleware, questionController.updateQuestion);
router.post('/', authMiddleware, questionController.createQuestion);
router.get('/detail/:id', authMiddleware, questionController.showQuestionPage);
router.delete('/delete/:id', authMiddleware, questionController.deleteQuestion);
module.exports = router;
