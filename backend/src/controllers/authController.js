const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, findUserById } = require("../services/userStore");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const formatUser = (user) => ({
  id: user?._id || user?.id,
  fullName: user.fullName,
  name: user.fullName,
  email: user.email,
  role: user.role,
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res, next) => {
  try {
    const fullName = (req.body.fullName || req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";
    const agreedToTerms = req.body.agreedToTerms ?? req.body.acceptedTerms ?? false;

    if (!fullName) return res.status(400).json({ message: "Full name is required." });
    if (!email) return res.status(400).json({ message: "Email is required." });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Please provide a valid email address." });
    if (!password) return res.status(400).json({ message: "Password is required." });
    if (!confirmPassword) return res.status(400).json({ message: "Confirm password is required." });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    if (!agreedToTerms) {
      return res.status(400).json({ message: "You must agree to the Terms and Privacy Policy before creating an account." });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: "Email is already registered." });

    const user = await createUser({
      fullName,
      email,
      password,
      agreedToTerms,
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: formatUser(user),
      token: createToken(user._id || user.id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered." });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email) return res.status(400).json({ message: "Email is required." });
    if (!password) return res.status(400).json({ message: "Password is required." });

    const user = await findUserByEmail(email, { includePassword: true });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

    res.json({
      message: "Logged in successfully.",
      user: formatUser(user),
      token: createToken(user._id || user.id),
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me };
