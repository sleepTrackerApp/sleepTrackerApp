# Alive Sleep Tracker App

The Alive Sleep Tracker App is a Node.js and Express-based web application that
provides a foundation for tracking and managing sleep-related data. The
application follows a clean, modular architecture and uses environment variables
to manage configuration across environments securely.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Features](#project-features)
- [Project Structure](#project-structure)
- [Application Architecture](#application-architecture)
- [Templates](#templates)
- [Mongodb Database Integration](#mongodb-database-integration)
- [Secure Environment Variable Management](#secure-environment-variable-management)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Static Assets](#static-assets)
- [Auth0 Integration](#auth0-integration)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [Version Control Practices](#version-control-practices)

# Technologies Used

- [Node.js](https://nodejs.org/) (Run-time environment)
- [Express.js](https://expressjs.com/) (Web framework)
- [Nodemon](https://nodemon.io/) (Development server auto-reloading)
- [MongoDB](https://www.mongodb.com/) (Database)
- [Mongoose](https://mongoosejs.com/) (MongoDB object modelling)
- [EJS](https://ejs.co/) (Embedded JavaScript templating)
- [dotenv](https://github.com/motdotla/dotenv) (Configuration management)
- [express-openid-connect](https://www.npmjs.com/package/express-openid-connect) (
  Authentication)
- [Mocha](https://mochajs.org/) (Test framework)
- [Chai](https://www.chaijs.com/) (Assertion library)
- [Supertest](https://github.com/visionmedia/supertest) (HTTP assertion library)
- [Sinon](https://sinonjs.org/) (Mock/stub library)
- [Proxyquire](https://github.com/thlorenz/proxyquire) (Testing module
  replacement library)

# Project Features

- [Express.js server with a modular and maintainable structure](#project-structure)
- [Server-side rendering using EJS templates](#templates)
- [MongoDB database integration](#mongodb-database-integration)
- [Secure environment variable management](#secure-environment-variable-management)
- [Centralised error handling (404 and 500 error pages)](#error-handling)
- [Centralised unit and integration testing](#testing)
- [Static asset handling for CSS and JavaScript](#static-assets)
- [Auth0 authentication integration for user login and registration](#auth0-integration)

## Project Structure

The codebase follows MVC-aligned architecture to keep responsibilities separated
and maintainability easy. Public assets such as CSS, JavaScript, and images live
in the `public` directory so they can be served directly without touching
application code. Core application logic is organised under `src`, where
controllers, helpers, models, routes, and views sit in their own folders, making
it simple to find and modify related functionality. Automated tests reside in
`tests`, grouped into helper utilities and integration flows, so quality checks
stay close to the code they validate. This separation keeps changes isolated,
improves onboarding for new contributors, and lets teams iterate on features
without stepping on each other’s work.

### Project Layout

```text
public/
├── img/                 # Image assets
├── css/                 # Stylesheets
└── js/                  # JavaScript files
src/
├── controllers/         # Application logic
├── helpers/             # Utility functions (DB, Auth0, config)
├── models/              # Database schemas
├── routes/              # Application routes
├── services/            # Domain-specific services
├── views/               # EJS templates and components
├── app.js               # Express app factory
└── server.js            # Server bootstrap
tests/
├── helpers/             # Test utilities
├── integration/         # Integration test suites
└── unit/                # Unit test suites
api/                     # Serverless API function for Vercel
docs/                    # Supporting documentation
.github/                 # GitHub actions
.env.example             # Example environment variables
.gitignore               # Git ignore rules
README.md                # Project documentation
package.json             # Project metadata and dependencies
package-lock.json        # Locked dependencies
vercel.json              # Vercel deployment configuration
```

## Application Architecture

### System Layout

The following diagram shows the main elements of the application, third-party
services, and their relationships:

![System Architecture](docs/charts/layout.png)

### Object Relationships

The following diagram illustrates the object relationships and data flow within
the application:

![Object Relationships](docs/charts/objects.png)

### Database Model

The following diagram shows the database model and relations between
collections:

![Database Model](docs/charts/model.png)

Source files for these diagrams (Mermaid format) are available in `docs/charts/`
and can be edited to reflect architectural changes.

## Templates

Views are built with EJS templates. Layout components such as headers,
navigation, and footers are defined in `src/views/components`, while page-level
templates are defined in `src/views/pages`. Templates receive data via
`res.render`, and shared locals are defined where they are needed, keeping the
layout flexible.

## MongoDB Database Integration

Database connectivity is handled through helper modules in `src/helpers/db.js`,
which wrap Mongoose connection management. Schemas and models live in
`src/models`, keeping database structure separate from business logic so models
can evolve without impacting controllers or routes.

## Secure Environment Variable Management

Configuration is centralised in `src/helpers/settings.js`, which loads values
via `dotenv` and exposes a frozen `appConfig` object. All modules—including the
AI helper and Contentful service—should read `OPENAI_API_KEY`,
`CONTENTFUL_SPACE_ID`, and `CONTENTFUL_ACCESS_TOKEN` from `appConfig` rather
than `process.env`. This keeps a single source of truth and consistent defaults
for local development.

## Error Handling

The application defines 404 and 500 flows, rendering dedicated EJS templates
from `src/views/pages/errors`. Centralising these handlers keeps user-facing
feedback consistent while ensuring unexpected failures are logged for further
investigation.

## Testing

The project uses a comprehensive testing setup with multiple libraries, each
serving a specific purpose:

### Testing Libraries

- **Mocha**: Test framework that provides the structure for organising and
  running tests with `describe` and `it` blocks
- **Chai**: Assertion library that provides readable assertions like
  `expect().to.be.true` and `expect().to.equal()`
- **Supertest**: HTTP assertion library that allows testing Express routes and
  middleware by simulating HTTP requests
- **Sinon**: Mocking and stubbing library used to create spies, stubs, and mocks
  for isolating units under test
- **Proxyquire**: Module replacement library that enables mocking dependencies
  when requiring modules, to isolate code under test

### How to Add Tests

1. **Unit Tests**: Place in `tests/unit/` matching the source structure
    - Example: `src/controllers/homeControllers.js` →
      `tests/unit/controllers/homeControllers.test.js`

2. **Integration Tests**: Place in `tests/integration/` organised by feature
   area
    - Example: API tests in `tests/integration/api/`, page tests in
      `tests/integration/pages/`

3. **Test Structure**:
   ```javascript
   const { expect } = require('chai');
   const sinon = require('sinon');
   const { functionToTest } = require('../../../src/path/to/module');

   describe('Module name', () => {
     afterEach(() => {
       sinon.restore(); // Clean up stubs after each test
     });

     it('should do something', () => {
       // Test implementation
       expect(result).to.equal(expected);
     });
   });
   ```

### Using Supertest

Supertest is used for integration tests that need to make HTTP requests to your
Express app:

```javascript
const {expect} = require('chai');
const {buildRequest} = require('../../helpers/testServer');

describe('API endpoints', () => {
    it('returns JSON response', async () => {
        const response = await buildRequest().get('/api');
        expect(response.status).to.equal(200);
        expect(response.type).to.match(/json/);
        expect(response.body).to.deep.equal({message: 'Welcome'});
    });
});
```

The `buildRequest()` helper from `tests/helpers/testServer.js` creates a test
client for the app.

### Using Sinon

Sinon is used for creating stubs, spies, and mocks to isolate code under test:

```javascript
const sinon = require('sinon');

// Stub a function
const stub = sinon.stub(module, 'functionName').returns('mocked value');

// Stub console methods
sinon.stub(console, 'error');

// Stub Express response methods
const res = {
    status: sinon.stub().returnsThis(),
    render: sinon.stub(),
    json: sinon.stub(),
};

// Verify calls
expect(res.render.calledOnceWithExactly('template', {data})).to.be.true;

// Clean up
sinon.restore();
```

### Using Proxyquire

Proxyquire is used to replace dependencies when requiring modules, allowing you
to inject mocks:

```javascript
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('Module with dependencies', () => {
    it('should use mocked dependency', () => {
        const mockDependency = {
            someFunction: sinon.stub().returns('mocked'),
        };

        const moduleUnderTest = proxyquire('../../../src/path/to/module', {
            '../path/to/dependency': mockDependency,
        });

        const result = moduleUnderTest.functionToTest();

        expect(mockDependency.someFunction.calledOnce).to.be.true;
        expect(result).to.equal('mocked');
    });
});
```

**Key Proxyquire options:**

- `.noCallThru()`: Prevents the original module from being loaded
- `.noPreserveCache()`: Ensures fresh module loads for each test

### Running Tests

Run all tests:

```bash
npm test
```

Run specific test file:

```bash
npx mocha tests/unit/controllers/homeControllers.test.js
```

Run tests matching a pattern:

```bash
npm test -- --grep "Error controllers"
```

## Static Assets

Frontend assets (stylesheets, scripts, images) are served from the `public`
directory via `express.static`. Templates reference them using path helpers (
`/css/styles.css`, `/js/scripts.js`), allowing assets to live outside the
application logic.

## Auth0 Integration

Authentication flows are powered by `express-openid-connect`. Configuration is
read from environment variables via `appConfig`, and middleware is instantiated
in `src/helpers/auth.js`.

### Privacy and Security

The application follows a privacy-first approach:

- **No private information stored**: User email addresses, names, or other
  personal data from Auth0 are never persisted to the database
- **Hashed identifiers**: The Auth0 user identifier (`sub`) is hashed using
  HMAC-SHA256 with a secret key before storage
- **Session-based data**: User profile information (name, email) is only
  available during the active session and is not saved
- **Secure hashing**: The `ENCRYPTION_KEY` environment variable is used as the
  secret for hashing, ensuring identifiers cannot be reversed
- **Export Data**: User data (e.g., sleep entries) may be exported by respected users to ensure complete transparency with what is collected and what the user may wish to do with their data.
- **Account Deletion**: User model data (e.g., sleep entries) upon account deletion via the Profile → Account Deletion will remove all user data stored within the models.
 

### User Login

To initiate a login flow, redirect users to `/auth/login`:

```javascript
// In a controller
res.redirect('/auth/login');

// Or with a custom return URL
res.redirect('/auth/login?returnTo=/dashboard');
```

The login route (`/auth/login`) automatically redirects to Auth0's hosted login
page. After successful authentication, users are redirected back to the
application (default: `/dashboard`).

### User Logout

To log out a user, redirect to `/auth/logout`:

```javascript
// In a controller
res.redirect('/auth/logout');

// Or in a template
<a href="/auth/logout">Sign Out</a>
```

The logout route invalidates the Auth0 session and redirects users to the home
page (`/`).


### Checking Authentication Status

Authentication checks should be handled by middleware at the route level. The
application provides two middleware functions for protecting routes:

- **`requireAuthRoute`**: Use this for page routes (HTML responses). If the user
  is not authenticated, it redirects them to `/auth/login` with a `returnTo`
  parameter containing the original URL. If authenticated, it calls `next()` to
  proceed to the route handler.

- **`requireAuthAPI`**: Use this for API routes (JSON responses). If the user is
  not authenticated, it returns a `401` status with a JSON error response. If
  authenticated, it calls `next()` to proceed to the route handler.

The `userSyncMiddleware` automatically populates `res.locals` with
authentication information when user is signed in. Controllers can access user
information from `res.locals` when needed:

```javascript
function myController(req, res) {
    // Access user information from res.locals (set by middleware)
    const isAuthenticated = res.locals.isAuthenticated; // Flag to check user auth status
    const isFirstLogin = res.locals.isFirstLogin; // Flag to check if first login
    const displayName = res.locals.displayName; // User's display name
    const userProfile = res.locals.userProfile; // User profile data
    const userRecord = res.locals.userRecord; // User record from DB

    res.render('template', {
        displayName,
        isAuthenticated: true,
    });
}
```

Authentication data set by the middleware ia also available in templates:

```ejs
<% if (typeof isAuthenticated !== 'undefined' && isAuthenticated) { %>
    <p>Welcome, <%= displayName %>!</p>
    <a href="/dashboard">My Sleep Data</a>
    <a href="/auth/logout">Sign Out</a>
<% } else { %>
    <a href="/auth/login">Sign In / Register</a>
<% } %>
```

### Available User Data

The `userSyncMiddleware` populates the following in `res.locals`:

- **`isAuthenticated`** (boolean): Whether the user is currently authenticated
- **`user`** (object|null): The full Auth0 user object (only during session)
- **`displayName`** (string|null): User's display name (name or email, fallback
  to null)
- **`userProfile`** (object|null): Non-sensitive profile with `sub`, `email`,
  and `name`
- **`userRecord`** (object|null): The database user record (contains only hashed
  identifier and timestamps)
- **`isFirstLogin`** (boolean): Whether this is the user's first login (based on
  timestamps)

### Protecting Routes

To protect routes and require authentication, use the provided middleware
functions in your route definitions:

**For Page Routes (HTML responses):**

Use `requireAuthRoute` middleware to protect page routes. Unauthenticated users
will be redirected to `/auth/login` with a `returnTo` parameter:

```javascript
const express = require('express');
const {requireAuthRoute} = require('../helpers/auth');
const {renderDashboard} = require('../controllers/dashboardControllers');

const router = express.Router();

// Protected route - redirects to login if not authenticated
router.get('/dashboard', requireAuthRoute, renderDashboard);

module.exports = router;
```

**For API Routes (JSON responses):**

Use `requireAuthAPI` middleware to protect API routes. Unauthenticated users
will receive a 401 JSON error:

```javascript
const express = require('express');
const {requireAuthAPI} = require('../helpers/auth');
const {getUserData} = require('../controllers/apiControllers');

const router = express.Router();

// Protected API route - returns 401 JSON error if not authenticated
router.get('/api/user', requireAuthAPI, getUserData);

module.exports = router;
```

**Middleware Behavior:**

- `requireAuthRoute`: Redirects unauthenticated users to
  `/auth/login?returnTo=<originalUrl>`
- `requireAuthAPI`: Returns `401` status with JSON error:
  `{ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } }`
- Both middleware functions call `next()` if the user is authenticated, allowing
  the route handler to proceed

### User Data Storage

When a user logs in for the first time:

1. Auth0 authenticates the user and returns their profile
2. The `userSyncMiddleware` extracts the Auth0 identifier (`sub`)
3. The identifier is hashed using HMAC-SHA256 with `ENCRYPTION_KEY`
4. A `User` document is created/updated in MongoDB with only:
    - `authIdHash`: The hashed Auth0 identifier
    - `lastLoginAt`: Timestamp of the last login
    - `createdAt` and `updatedAt`: Automatic timestamps

No email addresses, names, or other personal information are stored in the
database.

# Environment Variables

Create a `.env` file in the project root (or use system environment variables)
with the following keys:

| Variable                  | Example                                         | Description                                            |
|---------------------------|-------------------------------------------------|--------------------------------------------------------|
| `PORT`                    | `3000`                                          | Application port                                       |
| `BASE_URL`                | `http://localhost:3000`                         | Application base URL                                   |
| `MONGODB_URI`             | `mongodb://localhost:27017/alive-sleep-tracker` | MongoDB connection string                              |
| `NODE_ENV`                | `development`                                   | Node environment (`development`, `test`, `production`) |
| `ENCRYPTION_KEY`          | `development-only-secret-key`                   | Secret used to hash Auth0 identifiers                  |
| `AUTH0_ISSUER_BASE_URL`   | `https://dev-example.us.auth0.com`              | Auth0 application domain                               |
| `AUTH0_CLIENT_ID`         | `replace-with-auth0-client-id`                  | Auth0 client ID                                        |
| `AUTH0_CLIENT_SECRET`     | `replace-with-auth0-client-secret`              | Auth0 client secret                                    |
| `AUTH0_SECRET`            | `replace-with-auth0-session-secret`             | Auth0 session secret                                   |
| `OPENAI_API_KEY`          | *(optional)*                                    | OpenAI API key for AI-generated sleep insights         |
| `CONTENTFUL_SPACE_ID`     | *(optional)*                                    | Contentful space ID for insights/articles              |
| `CONTENTFUL_ACCESS_TOKEN` | *(optional)*                                    | Contentful access token for CMS content                |
| `VERCEL`                  | *(optional)*                                    | Serverless environment flag (Vercel)                   |

# How to Run

1. Install dependencies
   ```bash
   npm install
   ```
2. Set up environment variables  
   Create a `.env` file in the project root based on `.env.example`
3. Run tests (optional)
   ```bash
   npm test
   ```
4. Start the development server
   ```bash
   cd src
   node server.js
   ```
5. Open the application in a browser at `http://localhost:3000`

# Version Control Practices

- Sensitive configuration values should never be committed to GitHub
- Feature branches and pull requests must be used to ensure code quality and
  review
- Commit messages should follow a consistent, descriptive style

# Linting/Formatting Rules

To ensure the ALIVE application remains consistent with
our [Base UI Style Guide], we use automated linting and formatting. This keeps
our code clean, prevents bugs, and ensures our design tokens—like the Primary
Brand Color (#2B3990) and Midnight Background (#121212) are used correctly.

# The Tools

- ESLint (eslint.config.js): Acts as our "Logic Guard." It catches errors,
  unused variables, and suspicious code patterns before they reach production.

- Prettier (.prettierrc.json): Acts as our "Style Guard." It automatically
  handles code indentation and layout to match our 2-space standard, making the
  code as organized as our UI spacing scale (4px to 40px).

## How to Use

Before submitting your code, please run the following commands:

- npm run format: Automatically fixes code styling (indentation, quotes, etc.).

- npm run lint: Scans for logic errors and style guide violations.

- npm run lint:fix: Automatically fixes any basic logic issues found by the
  linter.

## Recommended VS Code Setup

For the best experience, install the ESLint and Prettier extensions. We
recommend enabling "Format on Save" in your settings so that your code snaps to
the ALIVE style guide automatically every time you save your work.

## Record New Sleep Entry

The backend now supports recording daily sleep entries with automatic duration
calculation and quality mapping.

### API Specification

- Endpoint: POST /recordsleep
- Purpose: Validates and stores sleep session data in MongoDB.
- Request Body (JSON):

      {
        "startTime": "YYYY-MM-DDTHH:MM:SS",
        "endTime": "YYYY-MM-DDTHH:MM:SS",
        "quality": "good | poor | missed"
      }

### Core Logic & Validation

- Duration Calculation: The server automatically calculates the hours slept
  based on the difference between startTime and endTime.

- Quality Mapping: Maps string inputs (good, poor, missed) to the numerical
  rating required by the SleepEntry schema.

- Error Handling: Implemented try/catch blocks to ensure a 500 Internal Server
  Error is returned during database failures instead of a system crash.

### Verification

Tested extensively via Postman to ensure a 201 Created status and successful
MongoDB document creation (verified by the return of a unique _id).


