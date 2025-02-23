import vivaresult from '../../model/vivaResult.model.js';

export const getVivaResultByStudentid = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Populate the 'vivaId' field with all details from the 'Viva' model
        const vivaResult = await vivaresult.find({ studentId }).populate('vivaId');

        console.log(vivaResult);

        if (!vivaResult || vivaResult.length === 0) {
            return res.status(404).json({ message: "No viva results found for the student" });
        }

        res.status(200).json(vivaResult);
    } catch (error) {
        console.error("Error fetching viva results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};