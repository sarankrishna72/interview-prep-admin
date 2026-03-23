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

exports.getApiQuestion = async (req, res) => {
  try {
    const { category, difficulty, questionType, limit } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (questionType) {
      filter.question_type = questionType;
    }
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const [questions, total] = await Promise.all([
      Question.aggregate([
        { $match: filter },
        { $sample: { size: limitNumber } },
        {
          $project: {
            id: { $toString: "$_id" }, // ✅ convert ObjectId → string
            _id: 0,                   // ✅ remove _id
            question: 1,
            options: 1,
            category: 1,
            difficulty: 1,
            question_type: 1,
            hint: 1,
            explanation: 1,
            correctIndex: 1
          }
        }
      ])
    ]);

    res.status(200).json({
      questions: questions,
      category, difficulty, question_type: questionType
    })
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      title: "Error"
    });
  }
}

exports.getQuestion = async (req, res) => {
  // If already logged in → redirect

   try {
    const { category, difficulty, questionType, page = 1, limit = 30 } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (questionType) {
      filter.question_type = questionType;
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

    res.render('question/list', {
        title: 'Question List',
        error: null,
        questions,
        category,
        difficulty,
        questionType,
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
     res.status(500).render('error', {
      message: "Failed to fetch questions",
      title: "Error"
    });
    // return res.status(500).json({
    //   message: "Failed to fetch questions",
    //   error: error.message
    // });
  }

 
  
};

exports.newQuestionPage = (req, res) => {
  res.render('question/new', {
    title: 'New Question'
  });
};

exports.editQuestionPage = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).render('error', {
        message: 'Question not found'
      });
    }
    res.render('question/edit', {
      title: 'Edit Question',
      question
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Server Error',
      title: "Error"
    });
  }
 
};

exports.showQuestionPage = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).render('error', {
        message: 'Question not found'
      });
    }
    res.render('question/show', {
      title: 'Question Details',
      question
    });

  } catch (error) {
    console.error(error);
    
    res.status(500).render('error', {
      message: 'Server Error',
      title: "Error"
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).render('error', {
        message: 'Question not found',
        title: 'Error'
      });
    }

    // Redirect to question list after delete
    res.redirect('/questions');

  } catch (error) {
    console.error(error);

    res.status(500).render('error', {
      message: 'Server Error',
      title: 'Error'
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const {
      question,
      difficulty,
      category,
      code,
      options,
      question_type,
      explanation,
      hint,
      correctIndex
    } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        question,
        difficulty,
        category,
        code,
        options: Array.isArray(options) ? options : options ? [options] : [],
        question_type,
        explanation,
        hint,
        correctIndex: parseCorrectIndex(correctIndex)
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).render('error', { error: 'Question not found' });
    }

    res.redirect('/questions'); // redirect to list page
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
};


exports.createQuestion = async (req, res) => {
  try {
    const {
      question,
      explanation,
      hint,
      category,
      difficulty,
      question_type,
      code,
      options
    } = req.body;

    const questionCr = new Question({
      question,
      explanation,
      hint,
      category,
      difficulty,
      question_type,
      code,
      options: Array.isArray(options) ? options : options ? [options] : [],
      correctIndex: parseCorrectIndex(req.body.correctIndex)
    });

    await questionCr.save();
    res.redirect('/questions/new');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      message: 'Server Error',
      title: "Error"
    });
  }
};