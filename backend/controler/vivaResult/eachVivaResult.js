import mongoose from "mongoose";
import VivaResult from "../../model/vivaResult.model.js";

export const getVivaResultByVivaId = async (req, res) => {
    try {
        const { vivaid } = req.params;  // Extract vivaId from URL
        console.log("Received Viva ID:", vivaid);

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(vivaid)) {
            return res.status(400).json({ 
                message: "Invalid Viva ID format", 
                success: false 
            });
        }

        const vivaResults = await VivaResult.findById(vivaid);

        if (!vivaResults) {
            return res.status(404).json({ 
                message: "No results found for this Viva", 
                success: false 
            });
        }

        res.status(200).json({
            message: "Viva results retrieved successfully",
            data: vivaResults,
            success: true
        });
    } catch (error) {
        console.error("Error fetching viva results:", error);
        res.status(500).json({ 
            message: error.message || "Server Error", 
            success: false 
        });
    }
};