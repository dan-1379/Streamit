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
```

### Running the app

```bash
npm start
```

Then open http://localhost:3000.

### Running the Angular app (development)

With the Express server running, in a second terminal:

```bash
cd streamit-public
npm install
npx ng serve
```

Then open http://localhost:4200.

## Project Structure

```
app_api/          REST API: routes, controllers, Mongoose models
app_server/       Server-rendered site: routes, controllers, Pug views
public/           Static files: stylesheets, scripts, images
streamit-public/  Angular application
test/             Automated API tests and test plan
bin/www           Server start-up
app.js            Express app configuration
```

## API Endpoints

All endpoints are prefixed with `/api` and return JSON.

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/users` | Create an account | 201 | 400, 409 |
| GET | `/users/:userid` | Get a user (without password) | 200 | 404 |
| PUT | `/users/:userid` | Update a user | 200 | 400, 404 |
| DELETE | `/users/:userid` | Delete a user | 204 | 404 |
| POST | `/login` | Log in | 200 | 400, 401 |
| GET | `/content` | List all titles (summary fields) | 200 | 500 |
| POST | `/content` | Add a title | 201 | 400, 409 |
| GET | `/content/:contentid` | Get one title (full details) | 200 | 404 |
| PUT | `/content/:contentid` | Update a title | 200 | 400, 404 |
| DELETE | `/content/:contentid` | Delete a title | 204 | 404 |

## Testing

The API has an automated test suite that runs against a temporary in-memory database, so it never touches the real data.

```bash
npm test
```

The full test plan is in [test/README.md](test/README.md). The tests also run automatically on GitHub Actions on every push to `main` (see the badge at the top).

## Deployment

The app is deployed on Render, which redeploys automatically on each push to `main`. `MONGODB_URI` is set as an environment variable in Render, and MongoDB Atlas network access allows connections from Render.

## Current Status and Known Limitations

- [x] Landing, sign-in, sign-up, home and content pages
- [x] REST API with validation and error messages
- [x] Automated API tests and CI
- [ ] Update and delete endpoints (in progress)
- [ ] Password hashing and session-based authentication (Passport)
- [ ] Restricting content management endpoints to admin users
- [ ] Angular data screen fetching from the API

## Credits

- Film and series images and descriptions sourced from [TMDB](https://www.themoviedb.org/) for educational, non-commercial use.
- UI built with [Bootstrap 5](https://getbootstrap.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/).
- Generative AI (Claude) was used to support debugging, code review and test writing. All code was reviewed and understood by the author.

## Author

Daniel Courtney, BSc Computing with Software Development, MTU Kerry