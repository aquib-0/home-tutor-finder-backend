const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const passport = require('passport');
const cors = require('cors');
require('./config/auth');

dotenv.config();
const app = express();


const allowedOrigins = ['https://home-tutor-finder.vercel.app/'];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions));
app.use(session({secret: 'cats'}));
app.use(passport.initialize());
app.use(passport.session());
const PORT = process.env.PORT || 5000;


app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/auth/google', 
    passport.authenticate('google', {scope: [ 'email', 'profile' ]})
);

app.get('/google/callback', 
    passport.authenticate('google', {
        successRedirect: 'http://localhost:5173/dashboard',
        failureRedirect: 'http://localhost:5173/student-login'
    })
)


connectDB()
.then(()=> app.listen(PORT, ()=> console.log("Server running on port 5000")))
.catch(err => console.log(err));