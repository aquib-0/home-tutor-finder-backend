const express = require('express');
const router = express.Router();
const {getAllCourses, getCourseByAuthor, getCourseById} = require('../controllers/courseController');

router.get('/all', getAllCourses);

router.get('author', getCourseByAuthor);

router.get('id', getCourseById);

module.exports = router;