import mongoose from "mongoose";
import Viva from "../../model/viva.model.js";

export const deleteViva = async (req, res) => {
    try {
        const { vivaid } = req.params;
        console.log("Received ID from request:", vivaid);

       

        // // Fetch the document first to verify it exists
        // const viva = await Viva.findById(vivaid);
        // console.log("Viva found before deletion:", viva);

        // if (!viva) {
        //     return res.status(404).json({ message: "Viva not found", success: false });
        // }

        // Delete the document
        await Viva.findByIdAndDelete(vivaid);
        return res.status(200).json({ message: "Viva deleted successfully", success: true });

    } catch (error) {
        console.error("Error deleting Viva:", error);
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};
