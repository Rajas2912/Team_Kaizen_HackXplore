import express from 'express'
import { createQuiz } from '../controler/quiz/createQuiz.js'
import { getQuizbyid } from '../controler/quiz/getQuizbyVivaid.js';
import { updateQuiz } from '../controler/quiz/updateQuiz.js';
import { getquizbyquizid } from '../controler/quiz/getquizbyquizid.js';
const router=express.Router();

// create quiz
router.post('/createQuiz',createQuiz);
router.get('/getquizbyid/:classid',getQuizbyid);
router.put('/updatequiz/:quizid',updateQuiz);
router.get('/getquizbyquizid/:quizid',getquizbyquizid);

export default router;