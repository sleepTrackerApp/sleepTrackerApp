Alive Sleep Tracker App

The Alive Sleep Tracker App is a Node.js and Express-based web application that provides a foundation for tracking and managing sleep-related data. The application follows a clean, modular architecture and uses environment variables to securely manage configuration across different environments.

Features

Express.js server with a modular and maintainable structure

Server-side rendering using EJS templates

MongoDB database integration

Secure environment variable management using dotenv

Static asset handling for CSS and JavaScript

Centralised error handling (404 and 500 error pages)

Technologies Used

Node.js

Express.js

MongoDB

EJS

dotenv


## Project Structure

```text
public/
├── css/
│   └── style.css
└── js/
    └── scripts.js

src/
├── controllers/
├── helpers/
├── models/
├── routes/
├── views/
├── app.js
└── server.js

tests/
.env.example
.gitignore
README.md
package.json
package-lock.json
---

Environment Variables

This project uses environment variables stored in a .env file for configuration that may differ between development and production environments.

Create a .env file in the project root directory with the following values:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/alive-sleep-tracker
NODE_ENV=development


The .env file is excluded from version control using .gitignore to protect sensitive information.

An example configuration file (.env.example) is included in the repository to document the required environment variables.

How to Run the Application
1. Install dependencies
npm install

2. Ensure MongoDB is running

Start MongoDB locally
or

Update the MONGODB_URI value in the .env file to use MongoDB Atlas

3. Start the server
cd src
node server.js

4. Open the application in a browser
http://localhost:3000

Static Assets

Static files such as CSS and JavaScript are served from the public directory using Express static middleware.

Example usage in EJS templates:

<link rel="stylesheet" href="/css/style.css">
<script src="/js/scripts.js"></script>

Version Control Practices

Sensitive configuration values are not committed to GitHub

A .env.example file documents required environment variables

Feature branches and pull requests are used to demonstrate proper Git workflow and provide development evidence

Author

Akashdeep Singh
