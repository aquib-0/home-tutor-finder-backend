const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const cors = require('cors');
const {google} = require("googleapis");
const User = require('./models/User');
const auth = require("./middleware/auth");
const multer = require("multer");
const stream = require("stream");
const Course = require("./models/Course");
const Video = require("./models/Video");


dotenv.config();
const PORT = process.env.PORT || 5000;
const upload = multer({storage: multer.memoryStorage()});

const app = express();

// const oauth2client = new google.Auth.OAuth2Client(
//   process.env.VITE_GOOGLE_CLIENT_ID,
//   process.env.VITE_GOOGLE_CLIENT_SECRET,
//   process.env.VITE_GOOGLE_REDIRECT_URI
// );
const oauth2client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  process.env.VITE_GOOGLE_REDIRECT_URI
);

const allowedOrigins = ['https://home-tutor-finder.vercel.app', 'http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true,
};

app.use(cors(corsOptions));
// app.use(session({secret: 'cats'}));
// app.use(passport.initialize());
// app.use(passport.session());



app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/protected', require('./routes/protected'));
app.use('/api/auth', require('./routes/auth'));
app.get('/api/auth/google', auth, (req, res)=>{
  const scopes = ['https://www.googleapis.com/auth/drive.file'];
  const authorizationUrl = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: req.user.id
  });

  res.json({url: authorizationUrl});
});
app.get('/api/auth/google/callback', async (req, res)=>{
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
app.post('/api/protected/upload-to-drive', auth, upload.single('videoFile'), async(req, res)=>{
  try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      } 

      // 3. Find the current user to get their tokens
      const user = await User.findById(req.user.id);
      if (!user || !user.googleAccessToken) {
        return res.status(401).send('User not found or Google account not connected.');
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


connectDB()
.then(()=> app.listen(PORT, ()=> console.log("Server running on port 5000")))
.catch(err => console.log(err));