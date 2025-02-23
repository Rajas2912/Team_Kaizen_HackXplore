import express from 'express';
import { addQuizResult } from "../controler/quizResult/addQuizResult.js";
import { getQuizResultsByQuizId } from '../controler/quizResult/getQuizResultsByQuizId.js';
import { getQuizResultsByStudentId } from '../controler/quizResult/getquizresultbystudentid.js';

const router=express.Router();
router.post('/addquizresult',addQuizResult);
router.get('/quizresultbyquizid/:quizid',getQuizResultsByQuizId);
router.get('/quizresultbystudentid/:studentId',getQuizResultsByStudentId);
export default router;