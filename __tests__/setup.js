// Runs before any test module is loaded (Jest setupFiles).
// Environment variables must be set here so server.js picks them up on import.
process.env.DATABASE_URL = "postgresql://fake";
process.env.GOOGLE_CLIENT_ID = "fake-client-id";
process.env.SESSION_SECRET = "test-secret";
process.env.NODE_ENV = "test";
