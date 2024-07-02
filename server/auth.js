const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const querystring = require('querystring');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SECRET_KEY = process.env.SECRET_KEY;

async function registerUser(email, password, name, isSpotify = false) {
    console.log("Registering user:", { email, name });

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new Error("User already exists");
    }

    let hashedPassword = null;
    if (!isSpotify) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            isSpotify
        },
    });

    return user;
}

async function loginUser(email, password) {
    console.log("Attempting login for:", email);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new Error("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

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
        throw new Error("Invalid token");
    }
}
async function getSpotifyAccessToken(code) {
    
    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        },
        body: querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI
        })
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error_description);
    }
    return data;
}

async function getSpotifyUserData(accessToken) {
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


module.exports = { getSpotifyAccessToken, getSpotifyUserData, registerUser, loginUser, verifyToken };
