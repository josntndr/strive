const jwt = require("jsonwebtoken");
const { findUserById } = require("../services/userStore");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized. Token failed." });
    }

    req.user = {
      id: user._id?.toString() || user.id,
      _id: user._id?.toString() || user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Token failed." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Not authorized as an admin." });
  }

  next();
};

module.exports = { protect, adminOnly };
