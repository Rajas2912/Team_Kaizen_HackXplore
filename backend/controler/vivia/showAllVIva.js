
import Viva from "../../model/viva.model.js"; // Import your Viva model


export const getallViva = async (req, res) => {
    try {
        const { classid } = req.params; // Get viva ID from request params
        const vivas = await Viva.find({classid}); // Fetch viva by ID
        if (vivas.length===0) {
            return res.status(404).json({
                 message: "Viva not found",
                 succes:false,
                });
        }
        res.status(200).json(vivas); 
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
