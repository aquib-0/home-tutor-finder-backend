const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
    title: {type: String, require: true},
    videoUrl: {type: String},
    // This ID comes from the cloud service (e.g., Cloudinary's public_id)
    // It's useful for managing the file (e.g., deleting it)
    public_id: {
        type: String,
        required: true,
    },
    uploader: {type: String, required: true},
    },
    {
        timestamps: true,
    }
);

const Video = mongoose.model("Video", VideoSchema);
module.exports = Video;