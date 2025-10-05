const Student = require('../models/Student');
const Course = require('../models/Course');

const getEnrolledCourse = async(req, res)=>{
    try {
        const {user_id} = req.query;
        const student = await Student.findById(user_id);
        const enrolledCourses = student.enrolledCourse;
        // console.log(enrolledCourses);
        res.status(200).json(enrolledCourses);
    } catch(err)
    {
        res.status(500).json({message: err.message});
    }
};

const enrollInCourse = async (req, res) => {
  const { studentId, courseId } = req.query;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledCourse: courseId } }, // ✅ prevents duplicates
      { new: true } // return updated document
    ).populate('enrolledCourse'); // optional, populate course details
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $addToSet: { enrolledStudents: studentId } ,
        $inc: {enrolledStudentsCount: 1}
      },
      { new: true } // return updated document
    ).populate('enrolledStudents'); // optional, populate course details

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student enrolled in course successfully",
      student: updatedStudent,
      course: updatedCourse
    });
  } catch (err) {
    console.error("Error enrolling student:", err);
    res.status(500).json({ message: err.message });
  }
};

const leaveCourse = async(req, res)=>{
  const { studentId, courseId } = req.query;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $pull: { enrolledCourse: courseId } }, // ✅ prevents duplicates
      { new: true } // return updated document
    ).populate('enrolledCourse'); // optional, populate course details
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { enrolledStudents: studentId },
        $inc: {enrolledStudentsCount: -1},
      },
      { new: true } // return updated document
    ).populate('enrolledStudents'); // optional, populate course details

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Course removed successfully",
      student: updatedStudent,
      course: updatedCourse
    });
  } catch (err) {
    console.error("Error removing course:", err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {getEnrolledCourse, enrollInCourse, leaveCourse}; //, getCourseById