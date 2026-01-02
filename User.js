const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

// Check if the model exists, otherwise create it
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
