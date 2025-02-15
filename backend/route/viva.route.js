import express from "express";
const router=express.Router();
import { createViva } from "../controler/vivia/createViva.js";
import { getallViva } from "../controler/vivia/showAllVIva.js";
import { updateViva } from "../controler/vivia/updateViva.js";
import { deleteViva } from "../controler/vivia/deleteViva.js";

// for crete viva
router.post("/createViva",createViva);
router.get("/getallViva/:classid",getallViva);
router.put("/updateViva/:vivaid",updateViva);
router.delete("/deleteViva/:vivaid",deleteViva);

export default router;