# Streamit

![API tests](https://github.com/dan-1379/Streamit/actions/workflows/tests.yml/badge.svg)

**Live site:** https://streamit-vcig.onrender.com
*(Hosted on Render's free plan: the first visit after a quiet period can take 30–60 seconds to start.)*

## Project Overview

This project emulates a streaming web application for browsing TV shows and films. Users cannot play content. Design inspiration was taken from Netflix and Amazon Prime, applying Jakob's Law throughout the pages.

The application presents a catalogue of films and shows. Selecting a title opens a content page with further information such as episodes, trailers and cast.

The application has the following screens:

1. Landing page
2. Sign in
3. Sign up
4. Home screen
5. Content page

## Design Prototype

The Figma prototype can be found here: [Figma Design](https://www.figma.com/design/5fiueTDYjInPampt8bNAKV/Web-Frameworks-Project?node-id=87-218&t=u3FohKLf3weOhE0Z-1). Each page contains a runnable prototype showing the user flows.

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MongoDB Atlas, Mongoose |
| Server | Node.js, Express |
| Server-rendered views | Pug, Bootstrap 5 |
| Client-side app | Angular (`streamit-public/`) |
| Authentication | Passport.js (passport-local-mongoose), express-session |
| Validation | Mongoose schema validation, validator.js |
| Testing | Node test runner, Supertest, mongodb-memory-server |
| CI | GitHub Actions |
| Hosting | Render |

## Architecture Diagram

```mermaid
architecture-beta
    group db(cloud)[Movie Database]
    group app(cloud)[Application server]
    group fe(cloud)[Movies Front end]

    service mongo(database)[MongoDB - BSON] in db
    service mongoose(disk)[Mongoose - JSON] in db
    service node(server)[Node js and Express - JSON] in app
    service angular(internet)[Angular - JSON] in fe

    mongo:R -- L:mongoose
    mongoose:R -- L:node
    node:R -- L:angular
```

## Getting Started

### Prerequisites

- Node.js 24 (LTS)
- A MongoDB Atlas cluster (or a local MongoDB)

### Installation

```bash
git clone https://github.com/dan-1379/Streamit.git
cd Streamit
npm install
```

Create a `.env` file in the project root:

```
MONGODB_URI=<your MongoDB connection string>
SESSION_SECRET=<your session secret>
```

To get a strong, random value for the session secret, use the following:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running the app

```bash
npm start
```

Then open http://localhost:3000. The app also serves over HTTPS at
https://localhost:8443 when a self-signed certificate is present (see
[Security](#security)).

### Running the Angular app (development)

The Angular component is built and served by Express as part of the main app on
port 3000, so for normal use you only need `npm start`.

To develop the Angular component with live reload, run it on its own in a second
terminal (with the Express server also running so its API is available):

```bash
cd streamit-public
npm install
npx ng serve
```

Then open http://localhost:4200. Because the Angular service calls the API with a
relative URL, the dev server needs the Express API reachable (via a proxy, or by
testing the built component through Express on port 3000).

## Project Structure

```
app_api/          REST API: routes, controllers, Mongoose models
app_server/       Server-rendered site: routes, controllers, Pug views
app_public/       Built Angular app served by Express
public/           Static files: stylesheets, scripts, images
streamit-public/  Angular application (source)
test/             Automated tests and test plan
bin/www           Server start-up
app.js            Express app configuration
```

## Authentication

User registration and login are handled by **Passport.js** (using the
`passport-local-mongoose` strategy) through the server-rendered routes:

| Method | Route | Description |
|---|---|---|
| GET / POST | `/signup` | Create an account (passwords are hashed and salted) |
| GET / POST | `/signin` | Log in |
| GET | `/logout` | Log out |

Sessions are managed with `express-session`. The data pages (`/home`,
`/title/:contentid`) require a logged-in session and redirect to `/signin`
otherwise.

## API Endpoints

The content API is prefixed with `/api` and returns JSON. Read endpoints are
public; write endpoints require a logged-in session (and return **401** if the
request is not authenticated).

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/content` | List all titles (summary fields) | 200 | 500 |
| POST | `/content` | Add a title *(auth required)* | 201 | 400, 401, 409 |
| GET | `/content/:contentid` | Get one title (full details) | 200 | 404 |
| PUT | `/content/:contentid` | Update a title *(auth required)* | 200 | 401, 404 |
| DELETE | `/content/:contentid` | Delete a title *(auth required)* | 200 | 401, 404 |

## Security

- **Password storage:** passwords are hashed and salted by
  `passport-local-mongoose`; the plain password is never stored.
- **Sessions:** authentication state is kept in a server-side session
  (`express-session`) with the session ID stored in a cookie.
- **Protected endpoints:** the content write operations (POST/PUT/DELETE) are
  guarded by an authentication middleware that rejects unauthenticated requests
  with `401`.
- **SSL/HTTPS:** locally the app can serve over HTTPS on port `8443` using a
  self-signed certificate (kept out of version control). The deployed site on
  Render is served over HTTPS automatically with a trusted certificate.

## Testing

The project has an automated test suite covering the authentication flow and the
content API. It runs against a temporary in-memory database, so it never touches
the real data.

```bash
npm test
```

The full test plan is in [test/README.md](test/README.md). The tests also run
automatically on GitHub Actions on every push to `main` (see the badge at the
top).

## Deployment

The app is deployed on Render, which redeploys automatically on each push to
`main`. `MONGODB_URI` and `SESSION_SECRET` are set as environment variables in
Render, and MongoDB Atlas network access allows connections from Render.

## Current Status and Known Limitations

- [x] Landing, sign-in, sign-up, home and content pages
- [x] REST content API with validation and error messages
- [x] Automated tests and CI
- [x] Password hashing and session-based authentication (Passport)
- [x] Content write endpoints restricted to authenticated users
- [x] Angular data screen fetching from the API
- [x] HTTPS/SSL (self-signed locally, Render in production)

## Credits

- Film and series images and descriptions sourced from [TMDB](https://www.themoviedb.org/) for educational, non-commercial use.
- UI built with [Bootstrap 5](https://getbootstrap.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/).

## Author

Daniel Courtney, BSc Computing with Software Development, MTU Kerry