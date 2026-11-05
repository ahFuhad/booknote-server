const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "booknook-client"
    });

    if (!payload.sub || !payload.email) {
      return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }

    req.user = {
      id: String(payload.sub),
      name: payload.name || "",
      email: String(payload.email).toLowerCase()
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session is invalid or expired. Please sign in again." });
  }
}

module.exports = { requireAuth };
