const express = require('express');
const router = express.Router();
const {getEnrolledCourse} = require('../controllers/studentController');
const {getCourseById} = require('../controllers/courseController');

router.get('/get-my-courses', getEnrolledCourse);

router.get('/get-unique-course', getCourseById);

module.exports = router;