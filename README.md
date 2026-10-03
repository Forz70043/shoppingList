## Authentication Token Handling

On login, the backend sets the JWT token as an httpOnly cookie. The token is never returned in the JSON response.
The frontend must not store or manage the token manually (no localStorage, no store). All authentication flows (including Google OAuth) use httpOnly cookies for JWT.
## HTTP Logging

The app uses morgan (integrated with Pino) for HTTP request logging:
- In development, uses 'dev' format; in production, 'combined' format
- The /health endpoint is excluded from logs
- Logs are structured and can be sent to a centralized system in production
- Sensitive data (passwords, tokens, PII) is never logged

## Architecture: Controller & Service Layer

The backend follows a clean separation of concerns:
- **Controllers** (in /controllers): Only orchestrate HTTP requests and responses, delegating all business logic to services.
- **Services** (in /services): Contain all business logic and data access for each domain (e.g., listService, itemService).
- **Models** (in /models): Define Sequelize ORM models.

This structure improves maintainability, testability, and scalability.

### Architecture Diagram (Summary)

- **Route** → calls **Controller**
- **Controller** → delegates to **Service** (no business logic)
- **Service** → contains all business logic, interacts with **Model**
- **Model** → Sequelize ORM, accesses the database

This ensures a clean separation of concerns and maintainable codebase.

# Grocery List Web App

A web application for managing a grocery list. The app allows users to create, update, and manage their shopping lists. Users can register, log in with email/password or through social authentication (future feature), and access their grocery lists.
## Features Implemented

- User Registration: Users can register with their email and password. Passwords are securely stored using bcryptjs.
- User Login: Users can log in with their registered email and password. A JWT (JSON Web Token) is returned upon successful login.
- Authentication: Passwords are hashed using bcryptjs, and JWT is used for authentication in protected routes.
- RESTful API: The app exposes a REST API for user authentication and managing grocery lists.
- Database: The app uses MySQL to store user data and grocery list items. Sequelize is used as an ORM for interacting with the database.

## Technologies Used

- Node.js: Backend runtime for handling requests and running the server.
- Express.js: Framework for building the RESTful API.
- Sequelize: ORM for interacting with MySQL.
- MySQL: Database for storing user and grocery list data.
- bcryptjs: Library for hashing passwords.
- JWT: JSON Web Token used for user authentication.
- Nodemon: Tool for automatically restarting the server during development.

## Setup Instructions
Prerequisites

- Node.js installed on your machine.
- MySQL installed and running.
- Environment variables set in a .env file.

## Installation

### Clone the repository:

    git clone <repository-url>
    cd shopping-list-app

### Install the dependencies:

    npm install

Set up your .env file in the root directory with the following configuration:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your-database-password
    DB_NAME=your-database-name
    PORT=5000
    JWT_SECRET=your-jwt-secret

### Start the MySQL server and create a database:

    CREATE DATABASE <your-database-name>;

### Run the application:

    npm run dev

Your application will be running on http://localhost:5000.

## API Endpoints

- POST /api/auth/signup: Register a new user with email and password.
- POST /api/auth/signin: Login with email and password, returns a JWT token.
- GET /api/lists: Get the authenticated user's grocery lists (requires JWT).
- POST /api/lists: Create a new grocery list (requires JWT).
- PUT /api/lists/:id: Update an existing grocery list (requires JWT).
- DELETE /api/lists/:id: Delete a grocery list (requires JWT).
- GET /health: Health check endpoint for monitoring (returns status, uptime, timestamp, database connection).

### Future Features

Social Authentication (OAuth) via Google, Facebook, etc.

Ability to sync the grocery list across devices.

User profile management and settings.

Notifications for list items and reminders.

### Troubleshooting

If you encounter the error EADDRINUSE: address already in use, follow these steps:

Kill the existing process using the port with 
    
    kill -9 <PID> 

or using a tool like Activity Monitor on macOS or Task Manager on Windows.
    
Restart the server using 
    
    npm run dev

## License

This project is licensed under the MIT License - see the LICENSE file for details.
Let me know if you need any further adjustments or additions to the README!

### Sequelize CLI configuration

The project uses a config/config.js file (not config.json) for sequelize-cli, which loads all DB parameters from environment variables. This allows you to run migrations and seeders with:

    npx sequelize-cli db:migrate

Make sure your .env file is correctly set up before running migrations.