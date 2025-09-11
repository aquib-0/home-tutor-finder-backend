const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/students', auth, async (req, res)=>{
    try{
        const students = await User.find({role: 'student'}).select('-password');
        res.json(students);
    } catch(err)
    {
        console.error(err.message);
        res.status(500).json({msg: "Server error"});
    }
});

router.get('/tutors', auth, async (req, res)=>{
    try{
        const tutors = await User.find({role: 'tutor'}).select('-password');
        res.json(tutors);
    } catch(err)
    {
        console.error(err.message);
        res.status(500).json({msg: "Server error"});
    }
});

module.exports = router;