/*
    Automating API Tests, Runnable with npm test

    This uses Node's built-in test runner (node:test), Supertest to send requests
    to the Express app, and mongodb-memory-server so every run uses a fresh,
    empty database instead of the real Atlas data.

    Auth now goes through Passport (passport-local-mongoose) on the app_server
    routes /signup and /signin, and the content write endpoints are protected,
    so these tests register/log in with a supertest agent before posting content.

    Resources used to write the tests:
    - https://nodejs.org/download/release/v24.17.0/docs/api/test.html
    - https://forwardemail.github.io/superagent/
    - https://typegoose.github.io/mongodb-memory-server/
    - https://github.com/forwardemail/supertest
    - https://totalshiftleft.ai/blog/api-testing-javascript

    Also used previous knowledge of testing from last years Software Testing module
*/

const { describe, test, before, after } = require("node:test");
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;

/* ------------------------------------------------------------------ */
/*  Testing Setup                                                     */
/* ------------------------------------------------------------------ */

before(async () => {
    // Starting a temp database and pointing the app at it before the app loads
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri("streamit-test");

    // Safety check to make sure tests are not run against Atlas
    assert.ok(
        process.env.MONGODB_URI.startsWith("mongodb://127.0.0.1"),
        "Tests must use the in-memory database, not MongoDB Atlas"
    )

    // Passport's session needs a secret. Locally this comes from .env, but CI
    // has no .env, so fall back to a throwaway value just for the test run.
    process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-secret";

    // Loads express app from app.js
    app = require("../app");

    // Waits until the database connection is open
    // Without this, the tests could send a request while the app is still connecting
    await mongoose.connection.asPromise();

    /*
        Ensures the unique index on email exists before any test runs.
        The user schema is not a validation rule, it tells MongoDB to create a unique index
        and the index is what rejects a second account with the same email.
        On an empty database, Mongoose creates that index in the background. Without this line,
        The test would create the user with an certain email, which succeeds. The duplicate test
        would then create it again before the index has finished building 
    */
    await mongoose.model("User").init();
})

after(async () => {
    // Closes the connection between the app and database
    await mongoose.disconnect();

    // Shuts down the temp MongoDB started in before and deletes the data
    await mongod.stop();
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Passwords must be strong (upper, lower, number, symbol, 8+)
const STRONG_PASSWORD = "Password1!";

// Build a unique registration form body each time so tests stay independent
let counter = 0;

const newRegistration = (changes = {}) => {
    counter = counter + 1;
    return {
        firstname: "Signup",
        lastname: "Tester",
        email: "signup.tester" + counter + "@streamit.com",
        password: STRONG_PASSWORD,
        ...changes
    };
};

/* ------------------------------------------------------------------ */
/*  Auth - Registration (POST /signup)                                */
/* ------------------------------------------------------------------ */

describe("POST /signup (registration)", () => {

    test("R1 valid registration redirects to /home (auto login)", async () => {
        const res = await request(app)
            .post("/signup")
            .type("form")
            .send(newRegistration());

        assert.equal(res.status, 302);
        assert.equal(res.headers.location, "/home");
    });

    test("R2 missing first name shows an error", async () => {
        const res = await request(app)
            .post("/signup")
            .type("form")
            .send(newRegistration({ firstname: "" }));

        assert.equal(res.status, 400);
        assert.match(res.text, /First name is required/);
    });

    test("R3 weak password lists what is missing", async () => {
        const res = await request(app)
            .post("/signup")
            .type("form")
            .send(newRegistration({ password: "password" })); // no upper, number or symbol

        assert.equal(res.status, 400);
        assert.match(res.text, /Password needs/);
    });

    test("R4 invalid email shows an error", async () => {
        const res = await request(app)
            .post("/signup")
            .type("form")
            .send(newRegistration({ email: "notanemail" }));

        assert.equal(res.status, 400);
        assert.match(res.text, /Email is not valid/);
    });

    test("R5 duplicate email is rejected", async () => {
        const dupe = newRegistration({ email: "dupe@streamit.com" });

        // first registration succeeds
        await request(app).post("/signup").type("form").send(dupe);

        // second with the same email is rejected
        const res = await request(app)
            .post("/signup")
            .type("form")
            .send(dupe);

        assert.equal(res.status, 400);
        assert.match(res.text, /already exists/);
    });
});

/* ------------------------------------------------------------------ */
/*  Auth - Login (POST /signin)                                       */
/* ------------------------------------------------------------------ */

describe("POST /signin (login)", () => {
    let user;

    before(async () => {
        user = newRegistration({ email: "login.tester@streamit.com" });
        await request(app).post("/signup").type("form").send(user);
    });

    test("L1 correct details redirect to /home", async () => {
        const res = await request(app)
            .post("/signin")
            .type("form")
            .send({ email: user.email, password: user.password });

        assert.equal(res.status, 302);
        assert.equal(res.headers.location, "/home");
    });

    test("L2 email in different case still logs in", async () => {
        const res = await request(app)
            .post("/signin")
            .type("form")
            .send({ email: user.email.toUpperCase(), password: user.password });

        assert.equal(res.status, 302);
        assert.equal(res.headers.location, "/home");
    });

    test("L3 wrong password returns 401", async () => {
        const res = await request(app)
            .post("/signin")
            .type("form")
            .send({ email: user.email, password: "WrongPass1!" });

        assert.equal(res.status, 401);
        assert.match(res.text, /Invalid email or password/);
    });

    test("L4 unknown email returns 401 (same message)", async () => {
        const res = await request(app)
            .post("/signin")
            .type("form")
            .send({ email: "nobody@streamit.com", password: STRONG_PASSWORD });

        assert.equal(res.status, 401);
        assert.match(res.text, /Invalid email or password/);
    });

    test("L5 missing password shows an error", async () => {
        const res = await request(app)
            .post("/signin")
            .type("form")
            .send({ email: user.email });

        assert.equal(res.status, 400);
        assert.match(res.text, /Password is required/);
    });

    test("L6 missing email shows an error", async () => {
        const res = await request(app)
            .post("/signin")
            .type("form")
            .send({ password: user.password });

        assert.equal(res.status, 400);
        assert.match(res.text, /Email is required/);
    });
});

/* ------------------------------------------------------------------ */
/*  Protected pages                                                   */
/* ------------------------------------------------------------------ */

describe("Protected routes", () => {

    test("P1 GET /home while logged out redirects to /signin", async () => {
        const res = await request(app).get("/home");

        assert.equal(res.status, 302);
        assert.equal(res.headers.location, "/signin");
    });

    test("P2 GET /title/:id while logged out redirects to /signin", async () => {
        const res = await request(app).get("/title/obsession");

        assert.equal(res.status, 302);
        assert.equal(res.headers.location, "/signin");
    });
});

/* ------------------------------------------------------------------ */
/*  Content test data                                                 */
/* ------------------------------------------------------------------ */

const TEST_FILM = {
    _id: 'obsession',
    title: 'Obsession',
    year: '2026',
    seasons: 'Film',
    rating: '18',
    description: 'A shy music store employee uses a strange wish to win the love of his childhood friend, but getting what he wanted comes at a sinister cost.',
    image: '/images/obsession/obsession.jpg',
    coverImage: '/images/obsession/obsession-cover.webp',
    type: 'film',
    cast: [
        { image: '/images/obsession/obsession-cast/Michael Johnston.webp', name: 'Michael Johnston', character: 'Bear' },
        { image: '/images/obsession/obsession-cast/Inde Navarrette.webp', name: 'Inde Navarrette', character: 'Nikki' },
        { image: '/images/obsession/obsession-cast/Cooper Tomlinson.webp', name: 'Cooper Tomlinson', character: 'Ian' },
        { image: '/images/obsession/obsession-cast/Megan Lawless.webp', name: 'Megan Lawless', character: 'Sarah' }
    ]
};

const TEST_SERIES = {
    _id: "outer-banks",
    title: "Outer Banks",
    year: "2026",
    seasons: "5 Seasons",
    rating: "15",
    description: "On a barrier island off North Carolina, a tight-knit group of teenagers known as the Pogues hunt for a legendary lost treasure.",
    image: "/images/outer-banks/outer-banks.jpg",
    coverImage: "/images/outer-banks/outer-banks-cover.webp",
    type: "series",
    episodes: [
        { image: "/images/outer-banks/outer-banks-episodes/Pilot.webp", title: "Pilot", description: "Season 1, episode 1.", time: "54m" },
        { image: "/images/outer-banks/outer-banks-episodes/The Lucky Compass.webp", title: "The Lucky Compass", description: "Season 1, episode 2.", time: "47m" }
    ],
    cast: [
        { image: "/images/outer-banks/outer-banks-cast/Chase Stokes.webp", name: "Chase Stokes", character: "John B" },
        { image: "/images/outer-banks/outer-banks-cast/Madelyn Cline.webp", name: "Madelyn Cline", character: "Sarah Cameron" }
    ]
};

/* ------------------------------------------------------------------ */
/*  Content - GET /api/content (open, no auth needed)                 */
/* ------------------------------------------------------------------ */

describe("GET /api/content", () => {
    let Content;

    before(async () => {
        Content = mongoose.model("Content");
        await Content.deleteMany({});
    });

    after(async () => {
        await Content.deleteMany({});
    });

    test("U28 list all returns 200 and empty array", async () => {
        const res = await request(app).get("/api/content");

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    test("U29 list all returns 200 and array of content", async () => {
        await Content.create(TEST_FILM);

        const res = await request(app).get("/api/content");

        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body));
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0]._id, TEST_FILM._id);
    });

    test("U30 list only includes the summary fields", async () => {
        const res = await request(app).get("/api/content");
        const item = res.body[0];

        assert.equal(item.title, TEST_FILM.title);
        assert.equal(item.image, TEST_FILM.image);
        assert.equal(item.type, TEST_FILM.type);

        // large fields left out by .select() in contentReadAll
        assert.equal(item.cast, undefined);
        assert.equal(item.episodes, undefined);
    });
});

/* ------------------------------------------------------------------ */
/*  Content - GET /api/content/:contentid (open)                      */
/* ------------------------------------------------------------------ */

describe("GET /api/content/:contentid", () => {
    let Content;

    before(async () => {
        Content = mongoose.model("Content");
        await Content.deleteMany({});
        await Content.create(TEST_FILM);
        await Content.create(TEST_SERIES);
    });

    after(async () => {
        await Content.deleteMany({});
    });

    test("U40 existing film returns 200 and the full document including cast", async () => {
        const res = await request(app).get("/api/content/" + TEST_FILM._id);

        assert.equal(res.status, 200);
        assert.equal(res.body._id, TEST_FILM._id);
        assert.equal(res.body.title, TEST_FILM.title);
        assert.equal(res.body.description, TEST_FILM.description);
        assert.equal(res.body.cast.length, TEST_FILM.cast.length);
        assert.equal(res.body.cast[0].name, TEST_FILM.cast[0].name);
    });

    test("U41 unknown id returns 404", async () => {
        const res = await request(app).get("/api/content/daniel-courtney-documentary");

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "contentid not found");
    });
});

/* ------------------------------------------------------------------ */
/*  Content - POST /api/content (protected: must be logged in)        */
/* ------------------------------------------------------------------ */

describe("POST /api/content (protected)", () => {
    let Content;
    let agent;

    before(async () => {
        Content = mongoose.model("Content");
        await Content.deleteMany({});

        // An agent keeps the session cookie between requests.
        // Registering auto-logs-in, so after this the agent is authenticated.
        agent = request.agent(app);
        await agent
            .post("/signup")
            .type("form")
            .send(newRegistration({ email: "content.admin@streamit.com" }));
    });

    after(async () => {
        await Content.deleteMany({});
    });

    test("U31a unauthenticated POST is rejected with 401", async () => {
        // plain request (no agent) = not logged in
        const res = await request(app)
            .post("/api/content")
            .send(TEST_FILM);

        assert.equal(res.status, 401);
        assert.equal(res.body.message, "Not authorised");
    });

    test("U31 valid film returns 201 and the created content", async () => {
        const res = await agent
            .post("/api/content")
            .send(TEST_FILM);

        assert.equal(res.status, 201);
        assert.equal(res.body._id, TEST_FILM._id);
        assert.equal(res.body.title, TEST_FILM.title);
        assert.equal(res.body.type, "film");
        assert.equal(res.body.cast.length, TEST_FILM.cast.length);
    });

    test("U32 valid series with episodes returns 201 and saves the episodes", async () => {
        const res = await agent
            .post("/api/content")
            .send(TEST_SERIES);

        assert.equal(res.status, 201);
        assert.equal(res.body.type, "series");
        assert.equal(res.body.episodes.length, TEST_SERIES.episodes.length);
        assert.equal(res.body.episodes[0].title, TEST_SERIES.episodes[0].title);
    });

    test("U33 coverImage is optional", async () => {
        const film = { ...TEST_FILM, _id: "no-cover-film" };
        delete film.coverImage;

        const res = await agent.post("/api/content").send(film);

        assert.equal(res.status, 201);
        assert.equal(res.body.coverImage, undefined);
    });

    test("U34 duplicate _id returns 409", async () => {
        const res = await agent.post("/api/content").send(TEST_FILM);

        assert.equal(res.status, 409);
        assert.equal(res.body.message, "Content with that id already exists");
    });

    test("U35 missing _id returns 400", async () => {
        const film = { ...TEST_FILM };
        delete film._id;

        const res = await agent.post("/api/content").send(film);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U36 invalid type returns 400", async () => {
        const res = await agent
            .post("/api/content")
            .send({ ...TEST_FILM, _id: "bad-type-film", type: "podcast" });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U37 episode missing a field returns 400", async () => {
        const series = {
            ...TEST_SERIES,
            _id: "bad-episode-series",
            episodes: [{ image: "/images/test-series/ep1.webp", description: "No title.", time: "45m" }]
        };

        const res = await agent.post("/api/content").send(series);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U38 cast member missing a field returns 400", async () => {
        const film = {
            ...TEST_FILM,
            _id: "bad-cast-film",
            cast: [{ image: "/images/test/actor.webp", character: "No name" }]
        };

        const res = await agent.post("/api/content").send(film);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U39 unknown fields are ignored and not saved", async () => {
        const film = {
            ...TEST_FILM,
            _id: "extra-field-film",
            director: "Eoin Mannix"
        };

        const res = await agent.post("/api/content").send(film);

        assert.equal(res.status, 201);
        assert.equal(res.body.director, undefined);
    });
});