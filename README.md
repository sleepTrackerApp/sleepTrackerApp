# Alive Sleep Tracker App

The Alive Sleep Tracker App is a Node.js and Express-based web application that provides a foundation for tracking and managing sleep-related data. The application follows a clean, modular architecture and uses environment variables to securely manage configuration across different environments.

# Technologies Used

- [Node.js](https://nodejs.org/) (Run-time environment)
- [Express.js](https://expressjs.com/) (Web framework)
- [MongoDB](https://www.mongodb.com/) (Database)
- [Mongoose](https://mongoosejs.com/) (MongoDB object modeling)
- [EJS](https://ejs.co/) (Embedded JavaScript templating)
- [dotenv](https://github.com/motdotla/dotenv) (Configuration management)
- [express-openid-connect](https://auth0.github.io/node-auth0/modules/_auth0_express_openid_connect.html) (Authentication)
- [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/), & [Supertest](https://github.com/visionmedia/supertest) (Testing)

# Project Features

- [Express.js server with a modular and maintainable structure](#project-structure)
- [Server-side rendering using EJS templates](#templates)
- [MongoDB database integration](#mongodb-database-integration)
- [Secure environment variable management](#secure-environment-variable-management)
- [Centralised error handling (404 and 500 error pages)](#error-handling)
- [Centralised unit and integration testing with Mocha, Chai, and Supertest](#testing)
- [Static asset handling for CSS and JavaScript](#static-assets)
- [Auth0 authentication integration for user login and registration](#auth0-integration)

## Project Structure

The codebase follows a clear MVC-aligned layout to keep responsibilities separated and easy to maintain. Public assets such as CSS, JavaScript, and images live in the `public` directory so they can be served directly without touching application code. Core application logic is organised under `src`, where controllers, helpers, models, routes, and views sit in their own folders, making it simple to find and modify related functionality. Automated tests reside in `tests`, grouped into helper utilities and integration flows, so quality checks stay close to the code they validate. This separation keeps changes isolated, improves onboarding for new contributors, and lets teams iterate on features without stepping on each other’s work.

### Directory Layout

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
├── views/               # EJS templates and components
├── app.js               # Express app factory
└── server.js            # Server bootstrap

tests/
├── helpers/             # Test utilities
└── integration/         # Integration test suites

.env.example             # Example environment variables
.gitignore               # Git ignore rules
README.md                # Project documentation
package.json             # Project metadata and dependencies
package-lock.json        # Locked dependencies
```

## Templates

Views are built with EJS templates. Layout components like headers, navigation, and footers live under `src/views/components`, while page-level templates live under `src/views/pages`. Templates receive data through `res.render`, and shared locals are established close to where they are needed, keeping the layout flexible.

## MongoDB Database Integration

Database connectivity is handled through helper modules in `src/helpers/db.js`, which wrap Mongoose connection management. Schemas and models live in `src/models`, keeping database structure separate from business logic so models can evolve without impacting controllers or routes.

## Secure Environment Variable Management

Configuration is centralised in `src/helpers/settings.js`, which loads values via `dotenv` and exposes a frozen `appConfig` object. This ensures all modules read settings from a single source of truth and that defaults are well-defined for local development.

## Error Handling

The application defines opinionated 404 and 500 flows inside `src/app.js`, rendering dedicated EJS templates from `src/views/pages/errors`. Centralising these handlers keeps user-facing feedback consistent while ensuring unexpected failures are logged for further investigation.

## Testing

`npm test` runs the project’s Mocha suites, which rely on Chai for assertions and Supertest for HTTP simulation. Integration tests live under `tests/integration` and exercise both API endpoints and rendered pages to ensure end-to-end behaviour works as expected.

## Static Assets

Frontend assets (stylesheets, scripts, images) are served from the `public` directory via `express.static`. Templates reference them using path helpers (`/css/styles.css`, `/js/scripts.js`), allowing assets to live outside the application logic.

## Auth0 Integration

Authentication flows are powered by `express-openid-connect`. Configuration is read from environment variables via `appConfig`, and middleware is instantiated in `src/helpers/auth.js`. Navigating to “Sign In / Register” triggers the Auth0-hosted login, with callbacks handled automatically under `/auth/login` and `/auth/callback`.

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
- Feature branches and pull requests must be used to ensure code quality and review
- Commit messages should follow a consistent, descriptive style