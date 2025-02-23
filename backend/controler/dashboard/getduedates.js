import mongoose from "mongoose";
import Class from "../../model/class.model.js"; 
import Quiz from "../../model/quiz.model.js"; // Import Quiz schema
import Viva from "../../model/viva.model.js"; // Import Viva schema
import Assignment from "../../model/assignment.model.js"; // Import Assignment schema


export const getDueDatesForStudent = async (req, res) => {
  const { studentId } = req.params; // Extract studentId from request parameters
  console.log("studentid:",studentId);
  try {
    // Step 1: Get all class IDs for the student
    const classes = await Class.find({ students: studentId }).select("_id name");

    if (!classes || classes.length === 0) {
      return res.status(200).json({
        quizzes: [],
        vivas: [],
        assignments: [],
        message: "Student is not enrolled in any classes.",
      });
    }

    const classIds = classes.map((cls) => cls._id); // Extract class IDs
    const classNameMap = classes.reduce((map, cls) => {
      map[cls._id.toString()] = cls.name; // Create a map of class IDs to class names
      return map;
    }, {});

    // Step 2: Retrieve quizzes, vivas, and assignments for those classes
    const quizzes = await Quiz.find({ classid: { $in: classIds } }).select(
      "quizname duedate classid"
    );
    const vivas = await Viva.find({ classid: { $in: classIds } }).select(
      "vivaname duedate classid"
    );
    const assignments = await Assignment.find({
      classId: { $in: classIds },
    }).select("title deadline classId");

    // Step 3: Format the data
    const formattedQuizzes = quizzes.map((quiz) => ({
      duedate: quiz.duedate,
      name: quiz.quizname,
      classname: classNameMap[quiz.classid.toString()],
    }));

    const formattedVivas = vivas.map((viva) => ({
      duedate: viva.duedate,
      name: viva.vivaname,
      classname: classNameMap[viva.classid.toString()],
    }));

    const formattedAssignments = assignments.map((assignment) => ({
      duedate: assignment.deadline,
      name: assignment.title,
      classname: classNameMap[assignment.classId.toString()],
    }));

    // Step 4: Return the formatted data
    res.status(200).json({
      quizzes: formattedQuizzes,
      vivas: formattedVivas,
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error("Error fetching due dates:", error);
    res.status(500).json({ message: "Failed to fetch due dates." });
  }
};