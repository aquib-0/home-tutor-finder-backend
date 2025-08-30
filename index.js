const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/auth');

dotenv.config();
const app = express();
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


// connectDB()
// .then(()=> app.listen(PORT, ()=> console.log("Server running on port 5000")))
// .catch(err => console.log(err));
connectDB()
.then(()=> console.log("connected to database"))
.catch(err => console.log(err));
module.exports = app;
