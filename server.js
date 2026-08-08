import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import pg from "pg";
import { OAuth2Client } from "google-auth-library";

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware: enable session support for logged-in users.
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(express.static(distDir));

// Verify Google ID token, upsert user, create session
// Route: receive a Google ID token, verify it, create/update the user, and start a session.
app.post("/auth/google", async (req, res) => {
  console.log("authtest: req");
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing credential" });
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email } = ticket.getPayload();
    const { rows } = await pool.query(
      `INSERT INTO users (google_id, email)
       VALUES ($1, $2)
       ON CONFLICT (google_id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email`,
      [googleId, email],
    );
    const user = rows[0];
    req.session.userId = user.id;
    req.session.email = user.email;
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Invalid credential" });
  }
});

// Return current session user
app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ id: req.session.userId, email: req.session.email });
  console.log("user id: ", res);
});

// Logout
app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Get all saved locations for the current user
app.get("/api/locations", async (req, res) => {
  console.log("api/locations: req.session.userId", req.session.userId);
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const { rows } = await pool.query(
      `SELECT name, lat, lon, position FROM locations
      WHERE user_id = $1 ORDER BY position ASC`,
      [req.session.userId],
    );
    console.log("rows get: ", rows);
    res.json(
      rows.map((r) => ({
        name: r.name,
        admin1: "",
        country: "",
        lat: Number(r.lat),
        lon: Number(r.lon),
        id: `${r.lat}-${r.lon}`,
      })),
    );
  } catch (err) {
    console.error("Get locations error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Replace all locations for the current user
app.put("/api/locations", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { locations } = req.body;
  console.log("server.js locations put: ", locations);
  if (!Array.isArray(locations)) {
    return res.status(400).json({ error: "locations must be an array" });
  }

  for (const location of locations) {
    const hasName =
      typeof location?.name === "string" && location.name.length > 0;
    const hasLat = Number.isFinite(location?.lat);
    const hasLon = Number.isFinite(location?.lon);
    if (!hasName || !hasLat || !hasLon) {
      return res.status(400).json({
        error: "each location must include name, lat, and lon",
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM locations WHERE user_id = $1", [
      req.session.userId,
    ]);
    console.log("server.js locations.length put", locations.length);
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      await client.query(
        `INSERT INTO locations (user_id, name, lat, lon, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.session.userId, location.name, location.lat, location.lon, i],
      );
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Save locations error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    client.release();
  }
});

app.get("/impressum", (_request, response) => {
  response.sendFile(path.join(distDir, "impressum.html"));
});

app.get("/datenschutz", (_request, response) => {
  response.sendFile(path.join(distDir, "datenschutz.html"));
});

app.get("*", (_request, response) => {
  response.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Weather app running at http://localhost:${PORT}`);
});
