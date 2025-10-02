const Course = require('../models/Course');

const getAllCourses = async(req, res)=> {
    try{
        const courses = await Course.find();
        res.json(courses);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const getCourseByAuthor = async(req, res)=>{
    const name = req.name;
    try{
        const courses = await Course.find({authorName: name});
        res.json(courses);
    } catch(err)
    {
        res.status(500).json({message: err.message});
    }
};

const getCourseById = async(req, res)=> {
    const id = req.id;
    try{
        const course = await Course.findById(id);
        res.json(course);
    } catch(err)
    {
        res.status(500).json({message: err.message});
    }
};

module.exports = {getAllCourses, getCourseByAuthor, getCourseById};