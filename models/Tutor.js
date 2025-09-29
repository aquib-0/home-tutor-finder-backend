const mongoose = require("mongoose");
const findorCreate = require("mongoose-findorcreate");
const bcrypt = require("bcrypt");

const TutorSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, require: true},
    displayPicture: {type: String, default: "https://github.com/shadcn.png"},
    googleId: {type: String,},
    githubId: {type: String,},
    bio: {type: String, default: "Promote Education", maxlength: 200},
    createdCourse: [{type: mongoose.Schema.Types.ObjectId, ref: "Course"},],
    enrolledCourse: [{type: mongoose.Schema.Types.ObjectId, ref: "Course"},],
    completedCourse: [{type: mongoose.Schema.Types.ObjectId, ref: "Course"},],
    },
    {
        timestamps: true,
    }
);

TutorSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(err)
    {
        next(err);
    }
});

TutorSchema.plugin(findorCreate);

const Tutor = mongoose.model("Tutor", TutorSchema);

module.exports = Tutor;