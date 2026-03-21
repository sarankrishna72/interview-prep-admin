function parseCorrectIndex(value) {
  try {
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

const Question = require("../models/question");


exports.getQuestion = async (req, res) => {
  // If already logged in → redirect

   try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 }),
      Question.countDocuments(filter)
    ]);

    // return res.status(200).json({
    //   data: questions,
    //   pagination: {
    //     total,
    //     page: pageNumber,
    //     limit: limitNumber,
    //     totalPages: Math.ceil(total / limitNumber),
    //     hasNextPage: pageNumber * limitNumber < total,
    //     hasPrevPage: pageNumber > 1
    //   }
    // });
    res.render('question/list', {
        title: 'Question List',
        error: null,
        questions,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            hasNextPage: pageNumber * limitNumber < total,
            hasPrevPage: pageNumber > 1
        }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch questions",
      error: error.message
    });
  }

 
  
};

exports.newQuestionPage = (req, res) => {
  res.render('question/new', {
    title: 'New Question'
  });
};

exports.editQuestionPage = (req, res) => {
  res.render('question/edit', {
    title: 'Edit Question'
  });
};


exports.createQuestion = async (req, res) => {
  try {
    const {
      title,
      explanation,
      hint,
      category,
      difficulty,
      question_type,
      code,
      options
    } = req.body;

    console.log(req.body)
    const question = new Question({
      question: title,
      explanation,
      hint,
      category,
      difficulty,
      question_type,
      code,
      options: Array.isArray(options) ? options : options ? [options] : [],
      correctIndex: parseCorrectIndex(req.body.correctIndex)
    });

    await question.save();
    res.redirect('/questions');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};