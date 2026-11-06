const path = require('path')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const dbPath = path.join(__dirname, 'books.db')

const initializeDatabase = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log('Connected to database at', dbPath)

    await db.exec(`
      DROP TABLE IF EXISTS book;
      CREATE TABLE book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER
      );
    `)

    console.log('Created book table.')

    await db.exec(`
      INSERT INTO book (title, author, price, pages) VALUES
        ('The Alchemist', 'Paulo Coelho', 350, 208),
        ('Wings of Fire', 'A. P. J. Abdul Kalam', 425, 180),
        ('The Hobbit', 'J. R. R. Tolkien', 550, 310),
        ('Pride and Prejudice', 'Jane Austen', 300, 432),
        ('The White Tiger', 'Aravind Adiga', 399, 321),
        ('Sapiens', 'Yuval Noah Harari', 650, 498),
        ('The Guide', 'R. K. Narayan', 275, 220),
        ('A Brief History of Time', 'Stephen Hawking', 475, 256);
    `)

    const books = await db.all('SELECT * FROM book;')
    console.log(`Successfully seeded ${books.length} books into the database:`)
    console.table(books)

    await db.close()
  } catch (error) {
    console.error('Database initialization failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }
