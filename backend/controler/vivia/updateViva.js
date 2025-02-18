import Viva from "../../model/viva.model.js";

export const updateViva = async (req, res) => {
    try {
        const { vivaid } = req.params; // Get Viva vivaid from URL
        const {  vivaname, timeofthinking, duedate, questionAnswerSet } = req.body;

        const updatedViva = await Viva.findByIdAndUpdate(
            vivaid,
            {  vivaname, timeofthinking, duedate, questionAnswerSet },
            { new: true, runValidators: true } // Return updated document
        );

        if (!updatedViva) {
            return res.status(404).json({ message: "Viva not found", success: false });
        }

        res.status(200).json({
            message: "Viva updated successfully",
            data: updatedViva,
            success: true
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
