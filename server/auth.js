  // auth.js
  const bcrypt = require("bcryptjs"); // libray for hashing
  const jwt = require("jsonwebtoken");
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const SECRET_KEY = "Hello World";

  async function registerUser(email, password, name) {
    console.log("Registering user:", { email, name });
    const hashedPassword = await bcrypt.hash(password, 10); // Encrypts the password with a salt factor of 10
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
    // Search for a user in the database by their email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password); // Check if the password is valid
    if (!valid) throw new Error("Invalid password");

    // Creates a JWT with a user's ID as the payload, signed with the secret key and set for an hour
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

    // Storing hte session in the session table
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
      },
    });

    return { token, user }; // returns the token and the user
  }

  async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded.userId;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  module.exports = { registerUser, loginUser, verifyToken };
