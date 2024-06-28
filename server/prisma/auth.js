// auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SECRET_KEY = 'your-secret-key';

async function registerUser(email, password, name) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  return user;
}

async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid password');

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
    },
  });

  return { token, user };
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = { registerUser, loginUser, verifyToken };
