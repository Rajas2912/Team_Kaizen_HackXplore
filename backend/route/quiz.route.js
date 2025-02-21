import express from 'express'
import { createQuiz } from '../controler/quiz/createQuiz.js'
import { getQuizbyid } from '../controler/quiz/getQuizbyVivaid.js';
const router=express.Router();

// create quiz
router.post('/createQuiz',createQuiz);
router.get('/getquizbyid/:classid',getQuizbyid);

export default router;