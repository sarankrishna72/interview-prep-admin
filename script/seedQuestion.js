const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('../models/question');
const html = require('./json/html.json'); 
const angular = require('./json/angular.json'); 
const args = process.argv.slice(2);
const questionTypeArg = args.find(arg => arg.startsWith('--type='));

const questionType = questionTypeArg ? questionTypeArg.split('=')[1] : 'html';

const seedQuestion = async () => {
    let data = html;
    if (questionType == "angular") {
        data = angular;
    }
    for (const que of data) {
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
            } = que;
            await mongoose.connect(process.env.MONGO_URI);
            await Question.create({
                question,
                difficulty,
                category: category.toLowerCase(),
                code,
                options,
                question_type,
                explanation,
                hint,
                correctIndex
            });
            console.log('Question Created Successfully');
            // process.exit();
        } catch (error) {
            console.error('Seed Error:', error);
            // process.exit(1);
        }
        // process.exit();
    }
    process.exit();
};
seedQuestion();