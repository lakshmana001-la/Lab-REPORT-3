const path = require('path')
const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const app = express()
const port = 3000
const dbPath = path.join(__dirname, 'books.db')

let db = null

app.use(express.json())

app.get('/books/', async (request, response) => {
  try {
    const books = await db.all('SELECT * FROM book;')
    response.status(200).json(books)
  } catch (error) {
    console.error('Error retrieving books:', error.message)
    response.status(500).json({ error: 'Unable to retrieve books.' })
  }
})

app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])

    if (!book) {
      return response.status(404).json({ error: 'Book not found.' })
    }

    response.status(200).json(book)
  } catch (error) {
    console.error('Error retrieving book:', error.message)
    response.status(500).json({ error: 'Unable to retrieve the book.' })
  }
})

app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [title, author, price, pages],
    )

    response.status(201).json({
      message: 'Book added successfully.',
      bookId: result.lastID,
    })
  } catch (error) {
    console.error('Error adding book:', error.message)
    response.status(500).json({ error: 'Unable to add the book.' })
  }
})

app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const { title, author, price, pages } = request.body
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [title, author, price, pages, bookId],
    )

    if (result.changes === 0) {
      return response.status(404).json({ error: 'Book not found.' })
    }

    response.status(200).json({ message: 'Book updated successfully.' })
  } catch (error) {
    console.error('Error updating book:', error.message)
    response.status(500).json({ error: 'Unable to update the book.' })
  }
})

app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId])

    if (result.changes === 0) {
      return response.status(404).json({ error: 'Book not found.' })
    }

    response.status(200).json({ message: 'Book deleted successfully.' })
  } catch (error) {
    console.error('Error deleting book:', error.message)
    response.status(500).json({ error: 'Unable to delete the book.' })
  }
})

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`)
    })
  } catch (error) {
    console.error(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
