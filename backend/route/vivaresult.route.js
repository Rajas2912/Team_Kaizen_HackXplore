import express from "express";
const router=express.Router();
import { getVivaResultByVivaId } from "../controler/vivaResult/eachVivaResult.js";
import { addVivaResult } from "../controler/vivaResult/addVivaResult.js";
import { getVivaResultByStudentid } from "../controler/vivaResult/getVivaResultbyStudentid.js";

router.post("/addvivaresult",addVivaResult);
router.get("/getvivaresult/:vivaid",getVivaResultByVivaId);
router.get("/getvivaresultbystudentid/:studentId",getVivaResultByStudentid);
export default router;