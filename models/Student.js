const mongoose = require('mongoose');
const findorCreate = require('mongoose-findorcreate');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, require: true},
    displayPicture: {type: String, default: "https://github.com/shadcn.png"},
    googleId: {type: String,},
    githubId: {type: String,},
    bio: {type: String, default: "Promote Education", maxlength: 200},
    enrolledCourse: [{type: mongoose.Schema.Types.ObjectId, ref: "Course"},],
    completedCourse: [{type: mongoose.Schema.Types.ObjectId, ref: "Course"},],
    },
    {
        timestamps: true,
    }
);

StudentSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(err) {
        next(err);
    }
});

StudentSchema.plugin(findorCreate);

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;