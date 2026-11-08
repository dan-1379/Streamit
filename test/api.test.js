/*
    Automating API Tests, Runnable with npm test

    This uses Node's built-in test runner (node:test), Supertest to send requests
    to the Express app, and mongodb-memory-server so every run uses a fresh,
    empty database instead of the real Atlas data.

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
/*  API Tests - User                                                  */
/* ------------------------------------------------------------------ */

const TEST_USER = {
    name: "Daniel Courtney",
    email: "dan.courtney@streamit.com",
    password: "password123"
}

const signupUser = {
    name: 'Signup Tester',
    email: 'signup.tester@streamit.com',
    password: 'password123'
};

// Need to create a unique email each time, so tests are independent
// Using a counter and incrementing it each time so its unique
let counter = 0;

const createNewUser = (changes) => {
    counter = counter + 1;

    const newUser = {
        name: signupUser.name,
        email: "signup.tester" + counter + "@streamit.com",
        password: signupUser.password
    }
    
    if (changes) {
        Object.assign(newUser, changes); // overwrite with any fields the test passes in
    }

    return newUser;
}

describe("POST /api/users (Sign up)", () => {

    test("U1: valid user returns 201 with _id, name and email", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(signupUser);

        assert.equal(res.status, 201);
        assert.ok(res.body._id);
        assert.equal(res.body.name, signupUser.name);
        assert.equal(res.body.email, signupUser.email);
    });

    test("U2 password not returned", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser());

        assert.equal(res.status, 201);
        assert.equal(res.body.password, undefined);
    });

    test("U3 email is saved in lowercase", async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ email: 'Mixed.Case@Streamit.com' }));

        assert.equal(res.status, 201);
        assert.equal(res.body.email, 'mixed.case@streamit.com');
    });

    test("U4 name and email are trimmed", async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ name: '  Dan Courtney  ', email: '  trimmed@streamit.com  ' }));

        assert.equal(res.status, 201);
        assert.equal(res.body.name, 'Dan Courtney');
        assert.equal(res.body.email, 'trimmed@streamit.com');
    });

    test("U5 duplicate email returns 409", async () => {
        const res = await request(app)
            .post('/api/users')
            .send(signupUser);

        assert.equal(res.status, 409);
        assert.equal(res.body.message, 'An account with that email already exists');
    });

    test("U6 duplicate email in capitals returns 409", async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ ...signupUser, email: signupUser.email.toUpperCase() });

        assert.equal(res.status, 409);
        assert.equal(res.body.message, 'An account with that email already exists');
    });

    test("U7a missing name returns 400", async () => {
        const user = createNewUser();
        delete user.name;

        const res = await request(app)
            .post('/api/users')
            .send(user);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Name is required');
    });

    test("U7b empty name returns 400", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser({ name: "" }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Name is required");
    });

    test("U8a empty email returns 400", async () => {
        const user = createNewUser();
        delete user.email;

        const res = await request(app)
            .post('/api/users')
            .send(user);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Email is required');
    });

    test("U8b empty email returns 400", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser({ email: "" }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Email is required");
    });

    test("U9a empty password returns 400", async () => {
        const user = createNewUser();
        delete user.password;

        const res = await request(app)
            .post('/api/users')
            .send(user);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Password is required');
    });

    test("U9b empty password returns 400", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser({ password: "" }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Password is required");
    });

    test("U10a empty body returns 400", async () => {
        const user = createNewUser();
        delete user.name;
        delete user.email;
        delete user.password;

        const res = await request(app)
            .post('/api/users')
            .send(user);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Name is required');
    });

    test("U10b empty body returns 400", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser({ name: "", email: "", password: "" }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Name is required");
    });

    test("U11 numbers in name return 400", async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser({ name: "Dan123" }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Name can only contain letters, spaces, apostrophes, and hyphens');
    });

    test('U12 fadas, apostrophes and hyphens are accepted', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ name: "Seán O'Brien-Murphy" }));

        assert.equal(res.status, 201);
        assert.equal(res.body.name, "Seán O'Brien-Murphy");
    });

    test('U13 name longer than 100 characters returns 400', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ name: 'a'.repeat(101) }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Name must not be longer than 100 characters');
    });

    test('U14 invalid email returns 400', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ email: 'notanemail' }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Please enter a valid email address');
    });

    test('U15 7-character password returns 400 (boundary)', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ password: '1234567' }));

        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Password must be at least 8 characters');
    });

    test('U16 8-character password is accepted (boundary)', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(createNewUser({ password: '12345678' }));

        assert.equal(res.status, 201);
    });
});


describe("GET /api/users/:userid", () => {
    let existingUser;

    // Creating a user than can be looked up and saves the response in existing user
    before(async () => {
        const res = await request(app)
            .post("/api/users")
            .send(createNewUser({ name: "Lookup Tester" }));

        existingUser = res.body;
    })

    test("U17 existing user returns 200 without password", async () => {
        const res = await request(app)
            .get("/api/users/" + existingUser._id);

        assert.equal(res.status, 200);
        assert.equal(res.body._id, existingUser._id);
        assert.equal(res.body.name, "Lookup Tester");
        assert.equal(res.body.email, existingUser.email);
        assert.equal(res.body.password, undefined);
    });

    test("U18 invalid id format returns 400", async () => {
        const res = await request(app)
            .get("/api/users/abc");

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "userid not found")
    });

    test("U19 valid format no such user returns 404", async () => {
        // Makes up a valid MongoDB ID that no user has, and turns it into a string
        // so it can go into the /api/users url
        const unknownId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .get("/api/users/" + unknownId);

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "userid not found");
    });
});

describe("POST /api/login", () => {
    let loginUser;

    // Creates a user to log in with before the tests in this block run
    before(async () => {
        loginUser = createNewUser({ name: "Login Tester" });
        await request(app).post("/api/users").send(loginUser);
    });

    test("U20 correct details return 200 without the password", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ email: loginUser.email, password: loginUser.password });

        assert.equal(res.status, 200);
        assert.ok(res.body._id);
        assert.equal(res.body.name, "Login Tester");
        assert.equal(res.body.email, loginUser.email);
        assert.equal(res.body.password, undefined);
    });

    test("U21 email in capitals with spaces returns 200", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ email: "  " + loginUser.email.toUpperCase() + "  ", password: loginUser.password });

        assert.equal(res.status, 200);
        assert.equal(res.body.email, loginUser.email);
    });

    test("U22 wrong password returns 401", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ email: loginUser.email, password: "wrongpassword" });

        assert.equal(res.status, 401);
        assert.equal(res.body.message, "Invalid email or password");
    });

    test("U23 unknown email returns 401 with the same message as a wrong password", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ email: "nobody@streamit.com", password: loginUser.password });

        assert.equal(res.status, 401);
        assert.equal(res.body.message, "Invalid email or password");
    });

    test("U24 missing password returns 400", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ email: loginUser.email });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Email and password are required");
    });

    test("U25 missing email returns 400", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ password: loginUser.password });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Email and password are required");
    });

    test("U26 empty body returns 400", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({});

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Email and password are required");
    });

    test("U27 email that isn't text returns 400", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({ email: 123, password: loginUser.password });

        assert.equal(res.status, 400);
    });
});


/* ------------------------------------------------------------------ */
/*  API Tests - Content                                               */
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
    description: "On a barrier island off North Carolina, a tight-knit group of teenagers known as the Pogues hunt for a legendary lost treasure linked to the disappearance of their leader's father.",
    image: "/images/outer-banks/outer-banks.jpg",
    coverImage: "/images/outer-banks/outer-banks-cover.webp",
    type: "series",
    episodes: [
        { image: "/images/outer-banks/outer-banks-episodes/Pilot.webp", title: "Pilot", description: "Season 1, episode 1.", time: "54m" },
        { image: "/images/outer-banks/outer-banks-episodes/The Lucky Compass.webp", title: "The Lucky Compass", description: "Season 1, episode 2.", time: "47m" },
        { image: "/images/outer-banks/outer-banks-episodes/The Forbidden Zone.webp", title: "The Forbidden Zone", description: "Season 1, episode 3.", time: "47m" },
        { image: "/images/outer-banks/outer-banks-episodes/Spy Games.webp", title: "Spy Games", description: "Season 1, episode 4.", time: "49m" },
        { image: "/images/outer-banks/outer-banks-episodes/Midsummers.webp", title: "Midsummers", description: "Season 1, episode 5.", time: "47m" },
        { image: "/images/outer-banks/outer-banks-episodes/Parcel 9.webp", title: "Parcel 9", description: "Season 1, episode 6.", time: "53m" },
        { image: "/images/outer-banks/outer-banks-episodes/Dead Calm.webp", title: "Dead Calm", description: "Season 1, episode 7.", time: "47m" },
        { image: "/images/outer-banks/outer-banks-episodes/The Runway.webp", title: "The Runway", description: "Season 1, episode 8.", time: "46m" }
    ],
    cast: [
        { image: "/images/outer-banks/outer-banks-cast/Chase Stokes.webp", name: "Chase Stokes", character: "John B" },
        { image: "/images/outer-banks/outer-banks-cast/Madelyn Cline.webp", name: "Madelyn Cline", character: "Sarah Cameron" },
        { image: "/images/outer-banks/outer-banks-cast/Madison Bailey.webp", name: "Madison Bailey", character: "Kiara" },
        { image: "/images/outer-banks/outer-banks-cast/Jonathan Daviss.webp", name: "Jonathan Daviss", character: "Pope" }
    ]
};

describe("GET /api/content", () => {
    let Content;

    // Start testing with empty content
    before(async () => {
        Content = mongoose.model("Content");
        await Content.deleteMany({});
    });

    // Remove what was added, so later tests start clean
    after(async () => {
        await Content.deleteMany({});
    });

    test("U28 list all returns 200 and empty array", async () => {
        const res = await request(app)
            .get("/api/content");

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    test("U29 list all returns 200 and array of content", async () => {
        // Add the test film straight into the database (setup, not part of the test)
        await Content.create(TEST_FILM);

        const res = await request(app)
            .get("/api/content");

        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body));
        
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0]._id, TEST_FILM._id);
    });

    test("U30 list only includes the summary fields", async () => {
        const res = await request(app)
            .get("/api/content");

        // Check 'Obsession' is returned in api content as the first index
        const item = res.body[0];

        // Check that the fields the home page needs are there
        assert.equal(item.title, TEST_FILM.title);
        assert.equal(item.image, TEST_FILM.image);
        assert.equal(item.type, TEST_FILM.type);

        // Check that the large fields are left out by .select() in contentReadAll
        assert.equal(item.cast, undefined);
        assert.equal(item.episodes, undefined);
    });
});

describe("POST /api/content", () => {
    // Start with an empty catalogue and clean up afterwards
    before(async () => {
        Content = mongoose.model("Content");
        await Content.deleteMany({});
    });

    // Remove what was added, so later tests start clean
    after(async () => {
        await Content.deleteMany({});
    });

    test("U31 valid film returns 201 and the created content", async () => {
        const res = await request(app)
            .post("/api/content")
            .send(TEST_FILM);

        assert.equal(res.status, 201);
        assert.equal(res.body._id, TEST_FILM._id);
        assert.equal(res.body.title, TEST_FILM.title);
        assert.equal(res.body.type, "film");
        assert.equal(res.body.cast.length, TEST_FILM.cast.length);
    });

    test("U32 valid series with episodes returns 201 and saves the episodes", async () => {
        const res = await request(app)
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

        const res = await request(app)
            .post("/api/content")
            .send(film);

        assert.equal(res.status, 201);
        assert.equal(res.body.coverImage, undefined);
    });

    test("U34 duplicate _id returns 409", async () => {
        const res = await request(app)
            .post("/api/content")
            .send(TEST_FILM);

        assert.equal(res.status, 409);
        assert.equal(res.body.message, "Content with that id already exists");
    });

    test("U35 missing _id returns 400", async () => {
        const film = { ...TEST_FILM };
        delete film._id;

        const res = await request(app)
            .post("/api/content")
            .send(film);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U36 invalid type returns 400", async () => {
        const res = await request(app)
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

        const res = await request(app)
            .post("/api/content")
            .send(series);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U38 cast member missing a field returns 400", async () => {
        const film = {
            ...TEST_FILM,
            _id: "bad-cast-film",
            cast: [{ image: "/images/test/actor.webp", character: "No name" }]
        };

        const res = await request(app)
            .post("/api/content")
            .send(film);

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Missing or invalid content fields");
    });

    test("U39 unknown fields are ignored and not saved", async () => {
        const film = {
            ...TEST_FILM, 
            _id: "extra-field-film", 
            director: "Eoin Mannix"
        };

        const res = await request(app)
            .post("/api/content")
            .send(film);

        assert.equal(res.status, 201);
        assert.equal(res.body.director, undefined);
    });
});

describe("GET /api/content/:contentid", () => {
    let Content;

    // Add one film (Obsession) and one series (Outer Banks) directly to the database before the tests
    before(async () => {
        Content = mongoose.model("Content");
        await Content.deleteMany({});
        await Content.create(TEST_FILM);
        await Content.create(TEST_SERIES);
    });

    // Clean up anything added
    after(async () => {
        await Content.deleteMany({});
    });

    test("U40 existing film returns 200 and the full document including cast", async () => {
        const res = await request(app)
            .get("/api/content/" + TEST_FILM._id);

        assert.equal(res.status, 200);
        assert.equal(res.body._id, TEST_FILM._id);
        assert.equal(res.body.title, TEST_FILM.title);
        assert.equal(res.body.description, TEST_FILM.description);
        assert.equal(res.body.cast.length, TEST_FILM.cast.length);
        assert.equal(res.body.cast[0].name, TEST_FILM.cast[0].name);
    })

    test("U41 unknown id returns 404", async () => {
        const res = await request(app)
            .get("/api/content/daniel-courtney-documentary");

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "contentid not found");
    })
});