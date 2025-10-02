const mongoose = require("mongoose");
const findorCreate = require("mongoose-findorcreate");

const CourseSchema = new mongoose.Schema({
    authorId: {type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true},
    authorName: {type: mongoose.Schema.Types.String, ref: "Tutor", required: true},
    authorEmail: {type: mongoose.Schema.Types.String, ref: "Tutor", require: true},
    authorDp: {type: mongoose.Schema.Types.String, ref: "Tutor"},
    courseName: {type: String, required: true},
    courseDescription: {type: String, required: true},
    courseSyllabus: {type: String, required: true},
    courseOutcome: {type: String, required: true},
    videoUrl: {type: String, required: true},
    videoThumbail: {type: String},
    // This ID comes from the cloud service (e.g., Cloudinary's public_id)
    // It's useful for managing the file (e.g., deleting it)
    public_id: {type: String, required: true},
    // duration: {type: Number, required: true},
    enrolledStudents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}],
    enrolledStudentsCount: {type: Number, default: 0},
    views: {type: Number, default: 0},
    uploadedAt: {type: Date, default: Date.now,},
    },
    {
        timestamps: true,
    }
);

CourseSchema.plugin(findorCreate);

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;