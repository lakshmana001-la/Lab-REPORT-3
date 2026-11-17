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
