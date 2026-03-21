const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');
router.get('/', questionController.getQuestion);
router.get('/new', questionController.newQuestionPage);
router.get('/edit/:id', questionController.editQuestionPage);
router.post('/', questionController.createQuestion);
module.exports = router;