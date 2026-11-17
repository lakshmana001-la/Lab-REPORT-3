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
