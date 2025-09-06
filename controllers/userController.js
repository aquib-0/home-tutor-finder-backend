const User = require('../models/User');
const bcrypt = require('bcrypt');

const getUser = async (req, res)=>{
    try{
        const users = await User.find();
        res.json(users);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const getTutors = async(req, res)=>{
    try{
        const tutors = await User.find({role: 'tutor'});
        console.log(tutors);
        res.status(200).json(tutors);
    } catch(err)
    {
        res.status(500).json({message: "Error occurred:" + err.message});
    }
}

const getStudents = async(req, res)=>{
    try{
        const tutors = await User.find({role: 'student'});
        res.json(tutors);
    } catch(err)
    {
        res.status(500).json({message: "Error occurred:" + err.message});
    }
}

const createUser = async (req, res)=>{
    const data = req.body;
    try{
        const newUser = await User.create(data);
        console.log("User created");
        
        res.status(201).json(newUser);
    } catch(err){
        res.status(500).json({message: err.message});
        console.log(err);
    }
};


const loginUser = async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        // If no user is found, RETURN immediately.
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials - no such user exists" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        // If passwords don't match, RETURN immediately.
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials - email or password mismatch" });
        }
        
        
        // This part only runs if both checks pass.
        return res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            bio: user.bio,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log(err);
    }
}
  

module.exports = {getUser, createUser, loginUser, getTutors, getStudents};