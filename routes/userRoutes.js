const express = require('express');
const router = express.Router();
const {getUser, createUser, loginUser, getTutors, getStudents} = require('../controllers/userController');

router.get('/user', getUser);

router.get('/tutors', getTutors);

router.get('/students', getStudents);

router.post('/login', loginUser);

router.post('/register', createUser);
  

module.exports = router;