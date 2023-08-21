/**1) Develop a user registration form and store its data in any database using Express.  Form should also contain file upload (single, multiple) with validations. */

const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3030;

// Set up database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'studentdb'
});

db.connect(err => {

    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Set up Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Validate and handle form submission
app.post('/register', upload.array('avatar', 3), [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Invalid email address.'),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const avatars = req.files.map(file => file.filename);

    // Insert user data into the database
    const sql = 'INSERT INTO users (name, email, avatar1) VALUES (?, ?, ?)';
    db.query(sql, [name, email, avatars[0], avatars[1], avatars[2]], (err, result) => {
        if (err) {
            console.error('Error inserting user data:', err);
            return res.status(500).send('Error inserting user data.');
        }
        res.send('User registered successfully.');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});