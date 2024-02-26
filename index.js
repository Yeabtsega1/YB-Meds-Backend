const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const { response } = require('express');

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error(err);
});

//crypto for password hashing
const crypto = require('crypto');
const secretKey = process.env.SECRET_KEY; // Accessing secret key from .env
console.log(secretKey);


// Define MongoDB Schemas and Models
const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Your APIs and Routes for registration, login, etc.

// Example API for creating a new user (registration)
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'Fill the credentials properly' });
    }

    // Save user to the MongoDB database
    const newUser = new User({ fullname, email, password });
    await newUser.save();

    // Create and return JWT token
    const user = { name: fullname };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    res.json({ accessToken: accessToken, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// // Example API for user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Fill the credentials properly' });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // User login successful
    // Create and return JWT token
    const accessToken = jwt.sign({ userId: user._id, name: user.fullname }, process.env.ACCESS_TOKEN);
    res.json({ accessToken, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to YB Meds Backend');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});