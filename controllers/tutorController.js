const Tutor = require('../models/Tutor');
const Course = require('../models/Course');

const getCreatedCourses = async(req, res)=>{
    try{
        const courses = await Course.find({authorId: req.user.id});
        res.status(200).json(courses);
    } catch(err)
    {
        res.status(500).json({message: err.message});
    }
};

const deleteCourse = async(req, res)=>{
    const {user_id, course_id} = req.body;
    try{
        const course = await Course.findOne({_id: course_id, authorId: user_id});
        if(!course)
        {
            res.status(400).json({message: "Course not found or you are not authorized"});
        }
        await Course.deleteOne({_id: course_id});
        res.status(200).json({message: "Deleted course successfully"});

    } catch(err)
    {
        res.status(500).json({message: err.message});
    }
};

module.exports = {getCreatedCourses, deleteCourse};