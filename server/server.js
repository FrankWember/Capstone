// server.js
const express = require('express');
const { registerUser, loginUser, verifyToken } = require('./auth');
const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await registerUser(email, password, name);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/protected', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const userId = await verifyToken(token);
    res.json({ userId });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
