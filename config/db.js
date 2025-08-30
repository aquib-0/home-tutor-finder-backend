const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async()=>{
    const connectionState = mongoose.connection.readyState;
    if(connectionState===1)
    {
        console.log("Already connected");
    }
    if(connectionState === 2)
    {
        console.log("connecting...");
    }
    try{
        mongoose.connect(MONGODB_URI, {dbName: 'home-tutor', bufferCommands: true});
        console.log("connected to database");
    } catch(err){
        console.log("Error connecting" + err.message);
    }
}

module.exports = connectDB;