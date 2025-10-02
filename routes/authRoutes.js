const express = require('express');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const auth = require('../middleware/auth');
const oauth2client = require('../googleClient');
const jwt = require('jsonwebtoken');
dotenv.config();
const router = express.Router();


router.post('/register', async (req, res)=>{
    const {username, email, password, role} = req.body;
    try{
    
    let user = await User.findOne({email});
    let student;
    let tutor;
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
    if(role === 'Student')
    {
         student = new Student({
            userId: user._id,
            username,
            email,
            password: hashedPassword
        });
        await student.save();
        res.status(201).json({msg: "User registered successfully"});
    }
    else if(role === "Tutor")
    {
        tutor = new Tutor({
            userId: user._id,
            username,
            email,
            password: hashedPassword
        });
        await tutor.save();
        res.status(201).json({msg: "User registered successfully"});
    }
    else{
        res.status(400).json({msg: "Invalid role provided"});
    }

    } 
    catch(err)
    {
        console.error(err.message);
        res.status(500).json({msg: "Server error"});
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
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
        {
            return res.status(400).json({msg: 'Invalid credentials - password'});
        }

        let payload;

        if(user.role === 'Student')
        {
            var student = await Student.findOne({userId: user._id});
            payload = {
            user: {
                id: student._id,
                userId: user._id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                bio: user.bio,
            }
        };
        }
        else if(user.role === 'Tutor')
        {
            var tutor = await Tutor.findOne({userId: user._id});
            payload = {
            user: {
                id: tutor._id,
                userId: user._id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                bio: user.bio,
            }
        };
        }

        //create a payload
        // const payload = {
        //     user: {
        //         id: user._id,
        //         email: user.email,
        //         username: user.username,
        //         avatar: user.avatar,
        //         role: user.role,
        //         bio: user.bio,
        //     }
        // };
        //sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '3h'},
            (err, token)=>{
                if(err) throw err;
                res.json({ token });
            }
        );
    } 
    catch(err)
    {
        console.error(err.message);
        res.status(500).json({msg: "Server error"});
    }
});

router.get('/google', auth, (req, res)=>{
  const scopes = ['https://www.googleapis.com/auth/drive.file'];
  const authorizationUrl = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: req.user.userId
  });

  res.json({url: authorizationUrl});
});

router.get('/google/callback', async (req, res)=>{
  const {code, state} = req.query;
  const userId = state;
  try{
    const {tokens} = await oauth2client.getToken(code);
    const {access_token, refresh_token} = tokens;
    await User.findByIdAndUpdate(userId, {
      googleAccessToken: access_token,
      googleRefreshToken: refresh_token,
    });

    console.log("Token acquired and saved");
    res.redirect(`${process.env.VITE_FRONTEND_URI}`);
  } catch(err)
  {
    console.error('Error exchanging authorization code for tokens:', err);
    res.status(500).send('Error during authentication');
  }
});



module.exports = router;