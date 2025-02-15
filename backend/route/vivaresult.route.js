import express from "express";
const router=express.Router();
import { getVivaResultByVivaId } from "../controler/vivaResult/eachVivaResult.js";
import { addVivaResult } from "../controler/vivaResult/addVivaResult.js";

router.post("/addvivaresult",addVivaResult);
router.get("/getvivaresult/:vivaid",getVivaResultByVivaId);
export default router;