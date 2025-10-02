const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

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
app.use(express.json());
// app.use(session({secret: 'cats'}));
// app.use(passport.initialize());
// app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/protected', protectedRoutes);

connectDB()
.then(()=> app.listen(PORT, ()=> console.log("Server running on port 5000")))
.catch(err => console.log(err));