const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Middleware
app.use(cors());
app.use(express.json());

// Security Middleware: Block access to sensitive files
app.use((req, res, next) => {
    const forbidden = ['.env', 'server.js', 'package.json', 'package-lock.json', '.git', '.gitignore'];
    if (forbidden.some(file => req.url.includes(file))) {
        return res.status(403).send('Access Forbidden');
    }
    next();
});

app.use(express.static(__dirname));
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', UserSchema);

// Goal Schema
const GoalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    type: { type: String, required: true }, // daily, weekly, monthly, yearly
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', GoalSchema);

// Birthday Schema
const BirthdaySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true }, // We will ignore year for recurring, or handle logic in frontend
    createdAt: { type: Date, default: Date.now }
});

const Birthday = mongoose.model('Birthday', BirthdaySchema);

// Routes

// Get Holidays (Hardcoded for India 2025)
app.get('/api/holidays', (req, res) => {
    const holidays = [
        { name: 'Republic Day', date: '2025-01-26', type: 'national' },
        { name: 'Maha Shivaratri', date: '2025-02-26', type: 'festival' },
        { name: 'Holi', date: '2025-03-14', type: 'festival' },
        { name: 'Good Friday', date: '2025-04-18', type: 'festival' },
        { name: 'Id-ul-Fitr', date: '2025-03-31', type: 'festival' },
        { name: 'Independence Day', date: '2025-08-15', type: 'national' },
        { name: 'Raksha Bandhan', date: '2025-08-09', type: 'festival' },
        { name: 'Janmashtami', date: '2025-08-16', type: 'festival' },
        { name: 'Gandhi Jayanti', date: '2025-10-02', type: 'national' },
        { name: 'Dussehra', date: '2025-10-02', type: 'festival' },
        { name: 'Diwali', date: '2025-10-20', type: 'festival' },
        { name: 'Christmas', date: '2025-12-25', type: 'festival' }
    ];
    res.json(holidays);
});

// Get Birthdays
app.get('/api/birthdays', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const birthdays = await Birthday.find({ user: verified.id });
        res.json(birthdays);
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});

// Add Birthday
app.post('/api/birthdays', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { name, date } = req.body;
        const newBirthday = new Birthday({ user: verified.id, name, date });
        await newBirthday.save();
        res.status(201).json(newBirthday);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Birthday
app.delete('/api/birthdays/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        await Birthday.findOneAndDelete({ _id: req.params.id, user: verified.id });
        res.json({ message: 'Birthday deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Goals
app.get('/api/goals', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const goals = await Goal.find({ user: verified.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});

// Add Goal
app.post('/api/goals', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { text, type } = req.body;
        const newGoal = new Goal({ user: verified.id, text, type });
        await newGoal.save();
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Goal (Edit / Toggle Complete)
app.put('/api/goals/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { text, isCompleted } = req.body;
        const updateData = {};
        if (text !== undefined) updateData.text = text;
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            updateData.completedAt = isCompleted ? new Date() : null;
        }

        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: verified.id },
            updateData,
            { new: true }
        );

        if (!updatedGoal) return res.status(404).json({ message: 'Goal not found' });
        res.json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Goal
app.delete('/api/goals/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, user: verified.id });
        if (!deletedGoal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Register
app.post('/api/register', async (req, res) => {
    const { username, password, mobileNumber, email } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, mobileNumber, email });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password
app.put('/api/change-password', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both old and new passwords' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- MEMORIES FEATURE ---
const multer = require('multer');
const fs = require('fs');

// Ensure upload directory exists
// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Memory Schema
const MemorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    image: { type: String }, // Legacy support
    media: [String], // New multi-file support
    createdAt: { type: Date, default: Date.now }
});
const Memory = mongoose.model('Memory', MemorySchema);

// Add Memory
app.post('/api/memories', upload.array('media', 10), async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { text } = req.body;

        const mediaPaths = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                mediaPaths.push(`uploads/${file.filename}`);
            });
        }
        // Handle single legacy file field if someone hits this endpoint differently, or just default to empty
        if (!mediaPaths.length && req.file) { // upload.array won't populate req.file typically, but just in case of middleware switch
            mediaPaths.push(`uploads/${req.file.filename}`);
        }

        if (mediaPaths.length === 0) return res.status(400).json({ message: 'At least one media file is required' });

        const newMemory = new Memory({
            user: verified.id,
            text,
            image: mediaPaths[0], // Set primary image for legacy compatibility
            media: mediaPaths
        });
        await newMemory.save();
        res.status(201).json(newMemory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Memories
app.get('/api/memories', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const memories = await Memory.find({ user: verified.id }).sort({ createdAt: -1 });
        res.json(memories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit Memory
app.put('/api/memories/:id', upload.array('media', 10), async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { text } = req.body;
        const updateData = { text };

        const mediaPaths = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                mediaPaths.push(`uploads/${file.filename}`);
            });
        }

        let query = { _id: req.params.id, user: verified.id };
        let updateOp = {};

        if (mediaPaths.length > 0) {
            // If new files are uploaded, should we replace or append? 
            // Typically append or replace. Let's append for "Add more photos" style, 
            // BUT typical CRUD PUT replaces. Let's use $push to append for now as user might want to add.
            // OR, maybe we should just set it if we want to support 'replace'.
            // Simplest for now: Append.
            // updateOp = { $set: updateData, $push: { media: { $each: mediaPaths } } };

            // Actually, if I update image (legacy) to be the first of new batch if none existed?
            // Let's just push.
            updateOp = {
                $set: updateData,
                $push: { media: { $each: mediaPaths } }
            };
        } else {
            updateOp = { $set: updateData };
        }

        const updatedMemory = await Memory.findOneAndUpdate(
            query,
            updateOp,
            { new: true }
        );

        if (!updatedMemory) return res.status(404).json({ message: 'Memory not found' });

        // Ensure legacy image field is populated if it was empty and we added media
        if (!updatedMemory.image && updatedMemory.media.length > 0) {
            updatedMemory.image = updatedMemory.media[0];
            await updatedMemory.save();
        }

        res.json(updatedMemory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Memory
app.delete('/api/memories/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const memory = await Memory.findOne({ _id: req.params.id, user: verified.id });

        if (!memory) return res.status(404).json({ message: 'Memory not found' });

        // Optional: Delete file from fs
        // const filePath = path.join(__dirname, 'public', memory.image);
        // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Memory.deleteOne({ _id: req.params.id });
        res.json({ message: 'Memory deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected Route Example
app.get('/api/dashboard', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select('-password'); // Exclude password
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Welcome to the dashboard', user });
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});

// --- EXPENDITURE FEATURE ---
const ExpenditureSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., Feed, Vet, Supplies
    date: { type: Date, default: Date.now }
});

const Expenditure = mongoose.model('Expenditure', ExpenditureSchema);

// Add Expense
app.post('/api/expenditures', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { title, amount, category, date } = req.body;

        const newExpense = new Expenditure({
            user: verified.id,
            title,
            amount,
            category,
            date: date || new Date()
        });

        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Expenses
app.get('/api/expenditures', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const expenses = await Expenditure.find({ user: verified.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Expense
app.put('/api/expenditures/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { title, amount, category, date } = req.body;
        const updateData = { title, amount, category };
        if (date) updateData.date = date;

        const updatedExpense = await Expenditure.findOneAndUpdate(
            { _id: req.params.id, user: verified.id },
            updateData,
            { new: true }
        );

        if (!updatedExpense) return res.status(404).json({ message: 'Expense not found' });
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Expense
app.delete('/api/expenditures/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const expense = await Expenditure.findOneAndDelete({ _id: req.params.id, user: verified.id });

        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- DIARY FEATURE ---
const DiarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Diary = mongoose.model('Diary', DiarySchema);

// Add Diary Entry
app.post('/api/diary', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { text } = req.body;

        const newEntry = new Diary({
            user: verified.id,
            text
        });

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Error adding diary entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Diary Entries
app.get('/api/diary', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const entries = await Diary.find({ user: verified.id }).sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Diary Entry (Only if same day)
app.put('/api/diary/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { text } = req.body;

        const entry = await Diary.findOne({ _id: req.params.id, user: verified.id });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        // Date Check
        const entryDate = new Date(entry.date).toDateString();
        const today = new Date().toDateString();

        if (entryDate !== today) {
            return res.status(403).json({ message: 'Can only edit entries created today' });
        }

        entry.text = text;
        await entry.save();
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Diary Entry (Only if same day)
app.delete('/api/diary/:id', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        const entry = await Diary.findOne({ _id: req.params.id, user: verified.id });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        // Date Check
        const entryDate = new Date(entry.date).toDateString();
        const today = new Date().toDateString();

        if (entryDate !== today) {
            return res.status(403).json({ message: 'Can only delete entries created today' });
        }

        await Diary.deleteOne({ _id: req.params.id });
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});



// --- NOTIFICATIONS ---
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Schedule Daily Reminder at 8:00 PM (20:00)
// Cron format: Minute Hour Day Month DayOfWeek
cron.schedule('0 20 * * *', async () => {
    console.log('Running daily reminder job...');
    try {
        const users = await User.find({});
        for (const user of users) {
            if (!user.email) continue;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Daily Diary & Expenditure Reminder',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Hi ${user.username},</h2>
                        <p>This is your daily reminder to update your <b>Diary</b> and log your <b>Expenditures</b> for today.</p>
                        <p>Keeping track of your day helps you stay organized and mindful!</p>
                        <br>
                        <a href="http://localhost:3000" style="background-color: #764ba2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                        <br><br>
                        <p>Best regards,<br>The Dairy Team</p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(`Error sending email to ${user.email}:`, error);
                } else {
                    console.log(`Reminder sent to ${user.email}: ` + info.response);
                }
            });
        }
    } catch (error) {
        console.error('Error in daily reminder job:', error);
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
