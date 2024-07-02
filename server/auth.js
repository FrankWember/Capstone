const bcrypt = require("bcryptjs"); // Library for hashing
const jwt = require("jsonwebtoken");
const querystring = require('querystring');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SECRET_KEY = process.env.SECRET_KEY;

// Function to register a new user
async function registerUser(email, password, name, isSpotifyUser = false) {
    console.log("Registering user:", { email, name, isSpotifyUser });

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
    const valid = password ? await bcrypt.compare(password, user.password) : false;
    if (!valid) {
        throw new Error("Invalid password");
    }

    // Create a JWT with the user's ID as the payload, signed with the secret key, valid for an hour
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

    // Store the session in the session table
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

// Function to fetch Spotify user data using an access token
async function getSpotifyUserData(accessToken) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
}

// Function to get Spotify access token using client credentials
async function getSpotifyAccessToken() {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        },
        body: querystring.stringify({
            grant_type: 'client_credentials'
        })
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error_description);
    }
    console.log(data);
    return data.access_token;
}
module.exports = { getSpotifyAccessToken, getSpotifyUserData, registerUser, loginUser, verifyToken };