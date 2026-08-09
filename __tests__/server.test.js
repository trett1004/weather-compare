// Backend route tests — runs in Node environment.
// pg and google-auth-library are mocked so no real DB or Google calls are made.
//
// NOTE: jest.mock factories are hoisted above variable declarations by babel-jest,
// so mock functions are created inside the factories and attached as properties
// on the mock constructors. They are retrieved into local consts after imports.

jest.mock("pg", () => {
  const query = jest.fn();
  const connect = jest.fn();
  const Pool = jest.fn(() => ({ query, connect }));
  Pool._query = query;
  Pool._connect = connect;
  return { Pool };
});

jest.mock("google-auth-library", () => {
  const verifyIdToken = jest.fn();
  const OAuth2Client = jest.fn(() => ({ verifyIdToken }));
  OAuth2Client._verifyIdToken = verifyIdToken;
  return { OAuth2Client };
});

import pg from "pg";
import { OAuth2Client } from "google-auth-library";
import request from "supertest";
import app from "../server.js";

const mockQuery = pg.Pool._query;
const mockConnect = pg.Pool._connect;
const mockVerifyIdToken = OAuth2Client._verifyIdToken;

beforeEach(() => {
  mockQuery.mockReset();
  mockConnect.mockReset();
  mockVerifyIdToken.mockReset();
});

async function signedInAgent({
  sub = "g-1",
  email = "user@example.com",
  id = 1,
} = {}) {
  mockVerifyIdToken.mockResolvedValueOnce({
    getPayload: () => ({ sub, email }),
  });
  mockQuery.mockResolvedValueOnce({ rows: [{ id, email }] });
  const agent = request.agent(app);
  await agent.post("/auth/google").send({ credential: "tok" });
  return agent;
}

describe("POST /auth/google", () => {
  it("returns 400 if credential is missing", async () => {
    const res = await request(app).post("/auth/google").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing credential");
  });

  it("returns 200 with user data on valid credential", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({ sub: "google-123", email: "user@example.com" }),
    });
    mockQuery.mockResolvedValue({
      rows: [{ id: 1, email: "user@example.com" }],
    });

    const res = await request(app)
      .post("/auth/google")
      .send({ credential: "valid-token" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, email: "user@example.com" });
  });

  it("returns 401 when verifyIdToken throws", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("bad token"));

    const res = await request(app)
      .post("/auth/google")
      .send({ credential: "bad-token" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credential");
  });

  it("upserts the user with the correct SQL and parameters", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({ sub: "g-99", email: "x@y.com" }),
    });
    mockQuery.mockResolvedValue({ rows: [{ id: 99, email: "x@y.com" }] });

    await request(app).post("/auth/google").send({ credential: "tok" });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      ["g-99", "x@y.com"],
    );
  });
});

describe("GET /api/me", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  it("returns user info when authenticated", async () => {
    const agent = await signedInAgent({ id: 7, email: "a@b.com" });
    const res = await agent.get("/api/me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 7, email: "a@b.com" });
  });
});

describe("POST /auth/logout", () => {
  it("destroys the session — subsequent /api/me returns 401", async () => {
    const agent = await signedInAgent();

    const logout = await agent.post("/auth/logout");
    expect(logout.status).toBe(200);
    expect(logout.body.ok).toBe(true);

    const me = await agent.get("/api/me");
    expect(me.status).toBe(401);
  });
});

describe("GET /api/locations", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/locations");
    expect(res.status).toBe(401);
  });

  it("returns mapped locations for the authenticated user", async () => {
    const agent = await signedInAgent({ id: 3 });
    mockQuery.mockResolvedValueOnce({
      rows: [{ name: "Berlin", lat: "52.5", lon: "13.4", position: 0 }],
    });

    const res = await agent.get("/api/locations");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        name: "Berlin",
        admin1: "",
        country: "",
        lat: 52.5,
        lon: 13.4,
        id: "52.5-13.4",
      },
    ]);
  });

  it("returns 500 when the database query fails", async () => {
    const agent = await signedInAgent();
    mockQuery.mockRejectedValueOnce(new Error("db down"));

    const res = await agent.get("/api/locations");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Database error");
  });
});

describe("PUT /api/locations", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app)
      .put("/api/locations")
      .send({ locations: [] });
    expect(res.status).toBe(401);
  });

  it("returns 400 if locations is not an array", async () => {
    const agent = await signedInAgent();
    const res = await agent.put("/api/locations").send({ locations: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("locations must be an array");
  });

  it("returns 400 if a location entry is missing required fields", async () => {
    const agent = await signedInAgent();
    const res = await agent
      .put("/api/locations")
      .send({ locations: [{ name: "", lat: "not-a-number", lon: null }] });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "each location must include name, lat, and lon",
    );
  });

  it("saves valid locations in a transaction and returns ok", async () => {
    const agent = await signedInAgent();
    const mockClient = {
      query: jest.fn().mockResolvedValue({}),
      release: jest.fn(),
    };
    mockConnect.mockResolvedValue(mockClient);

    const res = await agent.put("/api/locations").send({
      locations: [{ name: "Paris", lat: 48.85, lon: 2.35 }],
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("rolls back the transaction and returns 500 when an insert fails", async () => {
    const agent = await signedInAgent();
    const mockClient = {
      query: jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error("insert failed")),
      release: jest.fn(),
    };
    mockConnect.mockResolvedValue(mockClient);

    const res = await agent.put("/api/locations").send({
      locations: [{ name: "Rome", lat: 41.9, lon: 12.5 }],
    });

    expect(res.status).toBe(500);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe("Database", () => {
  it("Pool is initialised with DATABASE_URL", () => {
    expect(pg.Pool).toHaveBeenCalledWith({
      connectionString: "postgresql://fake",
    });
  });
});
