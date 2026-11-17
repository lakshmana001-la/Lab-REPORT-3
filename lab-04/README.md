| Information                   | Details                          |
| :---------------------------- | :------------------------------- |
| Student Name                  | MENDA LAKSHMANARAO               |
| Student Registration Number   | 252U1R5100                       |
| Class & Section               | 313 AI DE 2B                     |
| Study Level : UG/PG/Doctorate | UG                               |
| Year & Term                   | 2 & 2                            |
| Subject Name                  | Backend Development Fundamentals |
| Name of the Assessment        | LAB REPORT - 4                   |
| Date of Submission            | 17/11/2026                       |

---

# Lab 4: Registration, Login and JWT

## Objective

Build a secure user registration and login system using Express and SQLite. Implement password hashing with bcrypt to store passwords securely, generate JSON Web Tokens (JWT) upon successful authentication, and validate credentials using `bcrypt.compare()`. Practice stateless token-based authentication, parameterized SQL queries for injection prevention, and standardized HTTP response codes for registration and login workflows.

---

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Installation
Navigate into the `lab-04` directory and install project dependencies:
```bash
cd lab-04
npm install
```

### 2. Database Setup
Run the database setup script to create the `user` table in `users.db`:
```bash
npm run setup-db
```

### 3. Start the Server
```bash
npm start
```
The API server starts listening at `http://localhost:3000/`.

> **Note:** The JWT secret key is stored as a constant inside `app.js` for this lab. In Lab 8, the secret will be moved to a `.env` file using the `dotenv` package for better security.

---

## Database Structure

The SQLite database `users.db` contains a single table named `user`.

| Column   | Type    | Constraints                       |
| :------- | :------ | :-------------------------------- |
| id       | INTEGER | PRIMARY KEY AUTOINCREMENT         |
| username | TEXT    | UNIQUE NOT NULL                   |
| name     | TEXT    | NOT NULL                          |
| password | TEXT    | NOT NULL (stores bcrypt hash)     |

The `username` column is unique to prevent duplicate registrations. The `password` column stores only bcrypt-hashed passwords, never plain text.

---

## Endpoints Table

| Method | Endpoint     | Body                                     | Description         | Success Status  | Error Status      |
| :----- | :----------- | :--------------------------------------- | :------------------ | :-------------: | :---------------: |
| `POST` | `/register/` | `{ username, name, password }`           | Register a new user | `201 Created`   | `400 Bad Request` |
| `POST` | `/login/`    | `{ username, password }`                 | Login a user        | `200 OK`        | `400 Bad Request` |

### POST /register/

**Request Body:**
```json
{
  "username": "lakshman",
  "name": "Lakshman Rao",
  "password": "123456"
}
```

**Success Response (201 Created):**
```json
{
  "message": "User Created Successfully"
}
```

**Duplicate Username (400 Bad Request):**
```json
{
  "message": "User already exists"
}
```

### POST /login/

**Request Body:**
```json
{
  "username": "lakshman",
  "password": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Unknown Username (400 Bad Request):**
```json
{
  "message": "Invalid User"
}
```

**Incorrect Password (400 Bad Request):**
```json
{
  "message": "Invalid Password"
}
```

---

## Code Files

### `package.json`
```json
{
  "name": "lab-04",
  "version": "1.0.0",
  "description": "Lab 4 - Registration, Login and JWT",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "setup-db": "node setupDb.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite": "^5.1.1",
    "sqlite3": "^5.1.7",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### `setupDb.js`
```javascript
const path = require("path")
const sqlite3 = require("sqlite3")
const { open } = require("sqlite")

const dbPath = path.join(__dirname, "users.db")

const initializeDatabase = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `)

  console.log("Database initialized successfully")
  return db
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Setup complete")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Database setup failed:", error.message)
      process.exit(1)
    })
}

module.exports = { initializeDatabase }
```

### `app.js`
```javascript
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { initializeDatabase } = require("./setupDb")

const app = express()
const PORT = 3000
const JWT_SECRET = "my_secret_jwt_token_key"

app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await initializeDatabase()

    app.post("/register/", async (request, response) => {
      const { username, name, password } = request.body

      if (!username || !name || !password) {
        return response
          .status(400)
          .json({ message: "All fields are required" })
      }

      const existingUser = await db.get(
        "SELECT * FROM user WHERE username = ?",
        [username]
      )

      if (existingUser) {
        return response
          .status(400)
          .json({ message: "User already exists" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      await db.run(
        "INSERT INTO user (username, name, password) VALUES (?, ?, ?)",
        [username, name, hashedPassword]
      )

      response
        .status(201)
        .json({ message: "User Created Successfully" })
    })

    app.post("/login/", async (request, response) => {
      const { username, password } = request.body

      if (!username || !password) {
        return response
          .status(400)
          .json({ message: "Username and password are required" })
      }

      const user = await db.get(
        "SELECT * FROM user WHERE username = ?",
        [username]
      )

      if (!user) {
        return response
          .status(400)
          .json({ message: "Invalid User" })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return response
          .status(400)
          .json({ message: "Invalid Password" })
      }

      const payload = { username: user.username }
      const jwtToken = jwt.sign(payload, JWT_SECRET)

      response
        .status(200)
        .json({ jwt_token: jwtToken })
    })

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`)
    })
  } catch (error) {
    console.error(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

module.exports = app
```

---

## Output & Screenshots

### 1. Registration Success (`POST /register/` - 201 Created)
![Registration Success](screenshots/register_success.png)

### 2. Registration Duplicate Username (`POST /register/` - 400 Bad Request)
![Registration Duplicate](screenshots/register_duplicate.png)

### 3. Login Success (`POST /login/` - 200 OK)
![Login Success](screenshots/login_success.png)

### 4. Login Unknown User (`POST /login/` - 400 Bad Request)
![Login Unknown User](screenshots/login_unknown_user.png)

### 5. Login Wrong Password (`POST /login/` - 400 Bad Request)
![Login Wrong Password](screenshots/login_wrong_password.png)

### 6. SQLite Database Users View
![Database Users](screenshots/database_users.png)

### 7. Password Hash Verification
![Password Hash Verification](screenshots/password_hash_verification.png)

### 8. JWT Token Verification (jwt.io)
![JWT Token Verification](screenshots/jwt_token_verification.png)

---

## JWT Explanation

### What is JWT?
JSON Web Token (JWT) is an open standard for securely transmitting information between parties as a compact, self-contained JSON object. It is commonly used for stateless authentication in web applications.

### What is a Header?
The header contains metadata about the token, specifying the token type (`JWT`) and the signing algorithm (`HS256`).
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### What is a Payload?
The payload contains the claims or data stored inside the token. In this lab, the payload contains only the username of the authenticated user.
```json
{
  "username": "lakshman",
  "iat": 1700000000
}
```

### What is a Signature?
The signature is created by combining the encoded header, encoded payload and a secret key using the specified algorithm. It ensures the token has not been tampered with.
```
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Why should passwords never be included in JWT payloads?
JWT payloads are only Base64-encoded, not encrypted. Anyone who obtains the token can decode the payload and read its contents. Including passwords would expose them to anyone who intercepts the token.

---

## Viva Questions & Answers

### 1. Why do we use POST for login?
We use POST because login sends sensitive data like username and password. POST sends data in the request body, which is not visible in the URL. GET would expose credentials in the URL and browser history.

### 2. What is the difference between hashing and encryption?
Hashing is a one-way process that converts data into a fixed-length string and cannot be reversed. Encryption is a two-way process where data can be encrypted and decrypted using a key. Passwords should always be hashed, not encrypted.

### 3. What does `jwt.sign()` need?
`jwt.sign()` requires a payload object containing the data to include in the token and a secret key string used to sign the token. An optional third argument can specify options like expiration time.

### 4. What information should never be stored in the JWT payload?
Passwords, password hashes, credit card numbers, personal identification numbers and any other sensitive information should never be stored in the JWT payload because it can be easily decoded by anyone.

### 5. Why do we use bcrypt?
Bcrypt is a password hashing algorithm specifically designed for securely hashing passwords. It includes a salt to protect against rainbow table attacks and has a configurable cost factor to make brute force attacks slower.

### 6. What is the purpose of bcrypt.compare()?
`bcrypt.compare()` compares a plain text password with a bcrypt hash. It hashes the input password with the same salt used in the stored hash and checks if they match. It returns true if the password is correct and false otherwise.

### 7. What is a unique username?
A unique username means no two users in the database can have the same username. The database enforces this using the UNIQUE constraint on the username column, preventing duplicate registrations.

### 8. What is stateless authentication?
Stateless authentication means the server does not store session information. Instead, the client sends a token (like JWT) with each request. The server verifies the token without maintaining session state, making the system scalable.

### 9. Why do we use SQLite?
SQLite is a lightweight, serverless, file-based database that requires no separate installation or configuration. It is ideal for development, learning and small applications. The entire database is stored in a single file.

### 10. What is the purpose of a JWT signature?
The JWT signature verifies that the token has not been tampered with. It is created using the header, payload and a secret key. When the server receives a token, it recalculates the signature to ensure the token is authentic and unmodified.

---

## Debugging Notes

1. **Incorrect Database Import Path**:
   - **Cause:** Using wrong relative paths when importing `setupDb` module or database files across directory levels.
   - **Resolution:** Used `require("./setupDb")` with the correct relative path and `path.join(__dirname, "users.db")` to construct reliable, platform-independent absolute file paths.

2. **Missing `await` During Database Initialization**:
   - **Cause:** Omitting the `await` keyword before asynchronous database operations (`db.get()`, `db.run()`, `db.exec()`). This causes the function to return a pending Promise instead of resolved data.
   - **Resolution:** Declared all Express route handlers as `async (request, response) => { ... }` and prepended every database call with `await`.

3. **bcrypt Installation or Import Errors**:
   - **Cause:** bcrypt requires native C++ compilation. Missing Python or C++ build tools on Windows causes installation failure.
   - **Resolution:** Ran `npm install bcrypt` with administrator privileges. Ensured Python and Visual Studio C++ build tools were available.

4. **Port Already in Use (`EADDRINUSE`)**:
   - **Cause:** Occurs when Node.js tries to bind to port 3000 while another instance is already listening on the same port.
   - **Resolution:** Stopped lingering Node background processes using task manager or PowerShell (`Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force`).

5. **Duplicate Username Errors**:
   - **Cause:** Attempting to insert a user with a username that already exists in the database, triggering a UNIQUE constraint violation.
   - **Resolution:** Added a check using `SELECT * FROM user WHERE username = ?` before attempting to insert a new user. This provides a clear error message instead of a raw database constraint error.

6. **Invalid JWT Secret or Token Generation Issues**:
   - **Cause:** Using an undefined or empty string as the JWT secret, or accidentally including the password in the token payload.
   - **Resolution:** Ensured the JWT secret is defined as a constant string before calling `jwt.sign()`. Verified that only the username is included in the payload object.

7. **Incorrect SQL Table or Column Names**:
   - **Cause:** SQL queries targeting `users` (plural) when the schema defines `user` (singular), resulting in `SQLITE_ERROR: no such table: users`.
   - **Resolution:** Standardized table references to `user` across all SQL statements. Added `CREATE TABLE IF NOT EXISTS user (...)` during initialization.
