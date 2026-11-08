# API Test Plan

For this test plan, I asked `Claude` to parse my project and tell me what tests should be run in my testing file.

Automated tests for these cases are in `api.test.js`. Run them with `npm test`.

<br>

## Users: `POST /api/users` (sign up)

| # | Test case | Input | Expected |
|---|---|---|---|
| U1 | Valid user | name, email, password | `201`, returns `_id`, `name`, `email` |
| U2 | Password not returned | (same request) | no `password` in the response |
| U3 | Email saved in lowercase | `"Test.User@Streamit.com"` | `201`, `email` is `test.user@streamit.com` |
| U4 | Name and email trimmed | `"  Dan Courtney  "` | `201`, `name` is `Dan Courtney` |
| U5 | Duplicate email | the same email again | `409` "An account with that email already exists" |
| U6 | Duplicate email in capitals | `TEST.USER@...` | `409` |
| U7 | Name missing | no `name` | `400` "Name is required" |
| U8 | Email missing | no `email` | `400` "Email is required" |
| U9 | Password missing | no `password` | `400` "Password is required" |
| U10 | Empty body | `{}` | `400`, with a "required" message |
| U11 | Numbers in name | `"Dan123"` | `400` "Name can only contain letters, spaces, apostrophes, and hyphens" |
| U12 | Fadas, apostrophes, hyphens | `"Seán O'Brien-Murphy"` | `201` |
| U13 | Name too long | 101 characters | `400` "Name must not be longer than 100 characters" |
| U14 | Invalid email | `"notanemail"` | `400` "Please enter a valid email address" |
| U15 | Password 7 characters (boundary) | `"1234567"` | `400` "Password must be at least 8 characters" |
| U16 | Password exactly 8 characters (boundary) | `"12345678"` | `201` |

## Users: `GET /api/users/:userid`

| # | Test case | Input | Expected |
|---|---|---|---|
| U17 | Existing user | a created user's `_id` | `200`, the user without `password` |
| U18 | Invalid id format | `/api/users/abc` | `404` "userid not found" |
| U19 | Valid format, no such user | a new ObjectId | `404` "userid not found" |

## Users: `PUT` and `DELETE /api/users/:userid`

| # | Test case | Input | Expected |
|---|---|---|---|
| U20 | Update name | `{ "name": "New Name" }` | `200`, the updated user without `password` |
| U21 | Update with invalid data | `{ "email": "bad" }` | `400` |
| U22 | Update unknown user | a new ObjectId | `404` |
| U23 | Delete user | an existing `_id` | `204`, then GET returns `404` |
| U24 | Delete unknown user | a new ObjectId | `404` |

## Users: `POST /api/login`

| # | Test case | Input | Expected |
|---|---|---|---|
| L1 | Correct details | email + password | `200`, `_id`, `name`, `email`, no `password` |
| L2 | Email in capitals or with spaces | `" TEST.USER@STREAMIT.COM "` | `200` |
| L3 | Wrong password | correct email, wrong password | `401` "Invalid email or password" |
| L4 | Unknown email | an unregistered email | `401`, the same message as L3 |
| L5 | Password missing | email only | `400` "Email and password are required" |
| L6 | Email missing | password only | `400` "Email and password are required" |
| L7 | Empty body | `{}` | `400` "Email and password are required" |
| L8 | Email isn't text | `{ "email": 123, "password": "x" }` | `400` |

## Content: `GET /api/content`

| # | Test case | Input | Expected |
|---|---|---|---|
| C1 | List all | — | `200`, an array |
| C2 | List only has the summary fields | — | items have `title` and `image` but no `episodes` or `cast` |
| C3 | Empty catalogue | (no content) | `200`, `[]` |

## Content: `POST /api/content`

| # | Test case | Input | Expected |
|---|---|---|---|
| C4 | Valid film | all required fields, `type: "film"` | `201`, the created document |
| C5 | Valid series with episodes | `type: "series"` + `episodes[]` | `201`, episodes saved |
| C6 | `coverImage` is optional | no `coverImage` | `201` |
| C7 | Duplicate `_id` | the same `_id` again | `409` "Content with that id already exists" |
| C8 | Missing required field | without `title` (repeat for `year`, `seasons`, `rating`, `description`, `image`, `type`) | `400` "Missing or invalid content fields" |
| C9 | Missing `_id` | no `_id` | `400` |
| C10 | Invalid `type` | `"podcast"` | `400` "Missing or invalid content fields" |
| C11 | Episode missing a field | an episode without `title` | `400` |
| C12 | Cast member missing a field | a cast entry without `name` | `400` |
| C13 | Unknown field ignored | extra `"director": "X"` | `201`, `director` not saved |

## Content: `GET /api/content/:contentid`

| # | Test case | Input | Expected |
|---|---|---|---|
| C14 | Existing title | `/api/content/obsession` | `200`, the full document, including `cast` (and `episodes` for series) |
| C15 | Unknown id | `/api/content/does-not-exist` | `404` "contentid not found" |

## Content: `PUT` and `DELETE /api/content/:contentid`

| # | Test case | Input | Expected |
|---|---|---|---|
| C16 | Update a field | `{ "rating": "15" }` | `200`, `rating` is `15` |
| C17 | Update with invalid data | `{ "type": "podcast" }` | `400` |
| C18 | Update unknown id | `does-not-exist` | `404` |
| C19 | Delete | an existing id | `204`, then GET returns `404` |
| C20 | Delete unknown id | `does-not-exist` | `404` |

## General (applies to every endpoint)

| # | Test case | Input | Expected |
|---|---|---|---|
| G1 | Unknown API route | `GET /api/nothing` | `404` JSON |
| G2 | Broken JSON body | `{"name":` sent to `POST /api/users` | `400` JSON |