const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serves static files directly from the flat root directory
app.use(express.static(__dirname));

// MongoDB Atlas connection pointing to database M1 with your credentials
const mongoURI = "mongodb+srv://jamal:123@cluster0.ec5qpip.mongodb.net/M1?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Atlas (Database: M1)"))
    .catch(err => console.error("Database connection error:", err));

// Database Schema
const applicantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organization: { type: String, required: true },
    age: { type: Number, required: true },
    certificate: { type: String, required: true }
    city: { type: String, required: true }
}, { timestamps: true });

const Applicant = mongoose.model('Applicant', applicantSchema);

// --- Routes ---

// Serve Applicant Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve Admin Page
app.get('/admin-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Handle Applicant Form Submission
app.post('/api/submit', async (req, res) => {
    try {
        const { name, organization, age, certificate } = req.body;
        const newApplicant = new Applicant({ name, organization, age, certificate, city });
        await newApplicant.save();
        res.status(201).json({ success: true, message: "Information submitted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving data." });
    }
});

// Admin Authentication and Data Retrieval
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'jamal' && password === '123') {
        try {
            const data = await Applicant.find().sort({ createdAt: -1 });
            return res.json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Error fetching data." });
        }
    }
    res.status(401).json({ success: false, message: "Invalid credentials." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
