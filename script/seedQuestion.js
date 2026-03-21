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
            await mongoose.connect(process.env.MONGO_URI);
            await Question.create(que);
            console.log('Question Created Successfully');
            // process.exit();
        } catch (error) {
            console.error('Seed Error:', error);
            // process.exit(1);
        }
        // process.exit();
    }

  
};
seedQuestion();