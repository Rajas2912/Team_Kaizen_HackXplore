import express from "express";
import multer from "multer";

import { createViva } from "../controler/vivia/createViva.js";
import { getallViva } from "../controler/vivia/showAllVIva.js";
import { updateViva } from "../controler/vivia/updateViva.js";
import { deleteViva } from "../controler/vivia/deleteViva.js";
import { getOneViva } from "../controler/vivia/getOneViva.js";
import { callgeminiapi } from "../controler/vivia/callgeminapi.js";
// for crete viva
const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Configure multer for file uploads
router.post("/createViva",createViva);
router.get("/getallViva/:classid",getallViva);
router.get("/getOneViva/:vivaid",getOneViva);
router.put("/updateViva/:vivaid",updateViva);
router.delete("/deleteViva/:vivaid",deleteViva);
// gemini api call 
router.post("/send-to-gemini", upload.single("audio"), callgeminiapi);

export default router;