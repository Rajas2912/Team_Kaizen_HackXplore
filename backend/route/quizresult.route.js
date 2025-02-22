import express from 'express';
import { addQuizResult } from "../controler/quizResult/addQuizResult.js";
import { getQuizResultsByQuizId } from '../controler/quizResult/getQuizResultsByQuizId.js';

const router=express.Router();
router.post('/addquizresult',addQuizResult);
router.get('/quizresultbyquizid/:quizid',getQuizResultsByQuizId);

export default router;