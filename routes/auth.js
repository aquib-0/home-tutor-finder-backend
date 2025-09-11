const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', async (req, res)=>{
    const {username, email, password, role} = req.body;
    try{
    
    let user = await User.findOne({email});
    //check if user already exists
    if(user){
        return res.status(400).json({msg: 'User already exists'});
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    //create new user
    user = new User({
        username,
        email, 
        password: hashedPassword,
        role,
    });

    await user.save();
    res.status(201).json({msg: "User registered successfully"});

    } 
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.post('/login', async (req, res)=>{
    const {email, password} = req.body;
    try{
        //check if user already exists
        const user = await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({msg: 'Invalid credentials - email'});
        }

        //check password
        const isMatch =  bcrypt.compare(password, user.password);
        if(!isMatch)
        {
            return res.status(400).json({msg: 'Invalid credentials - password'});
        }

        //create a payload
        const payload = {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                bio: user.bio,
            }
        };
        //sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '0.1h'},
            (err, token)=>{
                if(err) throw err;
                res.json({ token });
            }
        );
    } 
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



module.exports = router;