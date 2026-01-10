const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

// Authority Sign Up
exports.authoritySignUp = async (req, res) => {
  try {
    const { authorityId, name, email, wardId, password } = req.body;

    // Validate input
    if (!authorityId || !name || !email || !wardId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if authority ID already exists
    const existingAuthority = await User.AuthorityUser.findOne({
      authorityId: authorityId.toUpperCase(),
    });

    if (existingAuthority) {
      return res.status(400).json({ message: "Authority ID already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.AuthorityUser.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new authority user
    const newAuthority = new User.AuthorityUser({
      authorityId: authorityId.toUpperCase(),
      name,
      email,
      wardId: parseInt(wardId),
      password: hashedPassword,
      role: "authority",
    });

    await newAuthority.save();

    // Generate token
    const token = generateToken(newAuthority._id, "authority");

    res.status(201).json({
      message: "Authority account created successfully",
      token,
      user: {
        id: newAuthority._id,
        authorityId: newAuthority.authorityId,
        name: newAuthority.name,
        email: newAuthority.email,
        wardId: newAuthority.wardId,
        role: "authority",
      },
    });
  } catch (error) {
    console.error("Authority signup error:", error);
    res.status(500).json({ message: "Error creating authority account", error: error.message });
  }
};

// Authority Sign In
exports.authoritySignIn = async (req, res) => {
  try {
    const { authorityId, password } = req.body;

    // Validate input
    if (!authorityId || !password) {
      return res.status(400).json({ message: "Authority ID and password are required" });
    }

    // Find authority by ID
    const authority = await User.AuthorityUser.findOne({
      authorityId: authorityId.toUpperCase(),
    });

    if (!authority) {
      return res.status(401).json({ message: "Invalid authority ID or password" });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, authority.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid authority ID or password" });
    }

    // Generate token
    const token = generateToken(authority._id, "authority");

    res.status(200).json({
      message: "Sign in successful",
      token,
      user: {
        id: authority._id,
        authorityId: authority.authorityId,
        name: authority.name,
        email: authority.email,
        wardId: authority.wardId,
        role: "authority",
      },
    });
  } catch (error) {
    console.error("Authority signin error:", error);
    res.status(500).json({ message: "Error signing in", error: error.message });
  }
};

// Verify Authority Token
exports.verifyAuthorityToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    if (decoded.role !== "authority") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const authority = await User.AuthorityUser.findById(decoded.id);

    if (!authority) {
      return res.status(404).json({ message: "Authority not found" });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: authority._id,
        authorityId: authority.authorityId,
        name: authority.name,
        email: authority.email,
        wardId: authority.wardId,
        role: "authority",
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};
