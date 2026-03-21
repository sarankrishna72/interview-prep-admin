const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    // 🔹 Question text
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true
    },

    // 🔹 Category
    category: {
      type: String,
      required: true,
      enum: ['html', 'css', 'javascript', 'angular', 'react', 'python', 'mysql']
    },

    // 🔹 Difficulty
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard']
    },

    // 🔹 Optional code snippet
    code: {
      type: String,
      default: ''
    },

    // 🔹 Question type
    question_type: {
      type: String,
      required: true,
      enum: ['mcq', 'boolean', 'multi_answer']
    },

    // 🔹 Options (for MCQ / multi-answer)
    options: {
      type: [String],
      validate: {
        validator: function (value) {
          if (this.question_type === 'boolean') {
            return value.length === 2;
          }
          return value.length >= 2 && value.length <= 6;
        },
        message: 'Invalid number of options'
      }
    },

    // 🔹 Correct answers (supports multi-answer)
    correctIndex: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: 'At least one correct answer required'
      }
    },

    // 🔹 Explanation
    explanation: {
      type: String,
      default: ''
    },

    // 🔹 Hint
    hint: {
      type: String,
      default: ''
    },

    // 🔹 Active / inactive
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

module.exports = mongoose.model('Question', questionSchema);