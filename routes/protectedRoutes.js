const express = require('express');
const router = express.Router();
const {getTutors, getStudents} = require('../controllers/userController');
const {getCreatedCourses, deleteCourse} = require('../controllers/tutorController');
const {getAllCourses, getCourseByAuthor, getCourseById} = require('../controllers/courseController');
const {getEnrolledCourse, enrollInCourse, leaveCourse} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const {google} = require('googleapis');
const oauth2client = require('../googleClient');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Course = require("../models/Course");
const Student = require('../models/Student');
const multer = require("multer");
const stream = require("stream");
const Video = require('../models/Video');

router.get('/get-students', auth, getStudents);

router.get('/get-tutors', auth, getTutors);

router.get('/created-courses', auth, getCreatedCourses);

// router.delete('/delete-course', auth, deleteCourse);

router.get('/get-all-courses', auth, getAllCourses);

router.put('/enroll-in-course', auth, enrollInCourse);

router.put('/leave-course', auth, leaveCourse);

router.get('/get-enrolled-courses', auth, getEnrolledCourse);

router.get('/get-course-by-id', auth, getCourseById);

router.get('/get-course-by-author', auth, getCourseByAuthor);
// router.get('/student', auth, studentRoutes);


const upload = multer({storage: multer.memoryStorage()});
router.post('/upload-to-drive', auth, upload.single('videoFile'), async(req, res)=>{
  try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      } 

      // 3. Find the current user to get their tokens
      const user = await User.findById(req.user.userId);
      if (!user || !user.googleAccessToken) {
        return res.status(401).json({message: 'User not found or Google account not connected.'});
      }

      // 4. Set the credentials for the Google API client
      oauth2client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const drive = google.drive({ version: 'v3', auth: oauth2client });

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      // 5. Upload the file to Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: req.file.originalname,
          mimeType: req.file.mimetype,
        },
        media: {
          mimeType: req.file.mimetype,
          body: bufferStream,
        },
        fields: 'id, webViewLink',
      });

      const { id: fileId, webViewLink } = response.data;
      
      // Make the file public
      await drive.permissions.create({
        fileId: fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      const newCourse = new Course({
        authorId: req.user.id,
        authorName: req.body.authorName,
        authorEmail: req.body.authorEmail,
        authorDp: req.body.authorDp,
        courseName: req.body.courseName || 'Untitle',
        courseDescription: req.body.courseDescription,
        courseSyllabus: req.body.courseSyllabus,
        courseOutcome: req.body.courseOutcome,
        videoUrl: webViewLink,
        videoThumbnail: req.body.videoThumbnail,
        public_id: fileId
      });

      const updatedTutor = await Tutor.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { createdCourse: newCourse._id } }, // ✅ prevents duplicates
        { new: true } // return updated document
        ).populate('createdCourse'); // optional, populate course details
        if(!updatedTutor)
        {
          console.log("tutor not updated successfully");
        }
        console.log(updatedTutor);

      // 6. Save the video metadata to your own database
      const newVideo = new Video({
        title: req.body.courseName || 'Untitled Video',
        videoUrl: webViewLink,
        public_id: fileId,
        uploader: req.user.id,
      });

      await newCourse.save();
      console.log("Course uploaded successfully");

      await newVideo.save();
      res.status(200).json({ message: 'Course and video uploaded successfully!', video: newVideo });
    } catch (error) {
      console.error('Error during video upload:', error);
      res.status(500).send('An error occurred during the upload.');
    }
});

router.delete('/delete-course', auth, async (req, res) => {
  try {
    const { courseId } = req.query;

    // 1. Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Check if the requesting user is the author
    // if (course.authorId.toString() !== req.user.useriId) {
    //   return res.status(403).json({ message: 'Not authorized to delete this course' });
    // }

    // 3. Get the user to access their Google credentials
    const user = await User.findById(req.user.userId);
    if (!user || !user.googleAccessToken) {
      return res.status(401).json({ message: 'User not found or Google account not connected.' });
    }

    oauth2client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2client });

    // 4. Delete the file from Google Drive
    if (course.public_id) {
      try {
        await drive.files.delete({ fileId: course.public_id });
        console.log(`Google Drive file ${course.public_id} deleted successfully`);
      } catch (err) {
        console.error('Failed to delete file from Google Drive:', err.message);
      }
    }

    // 5. Delete the corresponding Video document
    await Video.findOneAndDelete({ public_id: course.public_id });

    // 6. Remove course from Tutor's createdCourse list
    await Tutor.findByIdAndUpdate(
      req.user.id,
      { $pull: { createdCourse: course._id } }
    );

    //Update the Student document by removing the currently deleting course
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      await Student.updateMany(
      { _id: { $in: course.enrolledStudents } }, // match all enrolled students
      { $pull: { enrolledCourse: course._id } } // remove course from their enrolledCourse
      );
      console.log(`Removed course ${course._id} from enrolled students`);
    }

    // 7. Delete the Course document itself
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: 'Course and associated video deleted successfully!' });
  } catch (error) {
    console.error('Error during course deletion:', error);
    res.status(500).json({ message: 'An error occurred while deleting the course.' });
  }
});


module.exports = router;