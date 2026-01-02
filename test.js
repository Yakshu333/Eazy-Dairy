const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/login_system';
console.log('MONGO_URI:', MONGO_URI);
mongoose.connect(MONGO_URI).then(() => {
    console.log('MongoDB Connected Successfully');
    process.exit(0);
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});
