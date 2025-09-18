const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String,},
    username: {type: String, require: true, unique: true},
    avatar: {type: String, default: "https://github.com/shadcn.png"},
    role: {type: String},
    googleId: {type: String,},
    githubId: {type: String,},
    googleAccessToken: {type: String},
    googleRefreshToken: {type: String},
    bio: {type: String, default: "Promote Education", maxlength: 200},
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        return next();
    }

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = bcrypt.hash(this.password, salt);
        next();
    } catch(err){
        next(err);
    }
});
userSchema.plugin(findOrCreate); // Add the plugin

const User = mongoose.model("User", userSchema);

module.exports = User;