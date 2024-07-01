const bcrypt = require("bcryptjs"); // Library for hashing
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SECRET_KEY = "Hello World"; // This should be stored securely and ideally loaded from environment variables

async function registerUser(email, password, name) {
    console.log("Registering user:", { email, name });

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Encrypts the password with a salt factor of 10
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
    console.log("Attempting login for:", email);
    // Search for a user in the database by their email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new Error("User not found");
    }

    // Check if the provided password matches the stored hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error("Invalid password");
    }

    // Creates a JWT with the user's ID as the payload, signed with the secret key, valid for an hour
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

    // Optionally store the session in the session table (if you have session persistence logic)
    await prisma.session.create({
        data: {
            userId: user.id,
            token,
        },
    });

    return { token, user }; // Returns the token and the user
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
