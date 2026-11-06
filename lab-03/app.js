const path = require('path')
const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const app = express()
const port = process.env.PORT || 3000
const dbPath = path.join(__dirname, 'books.db')

let db = null

app.use(express.json())

// Allowed columns and sort directions for safe SQL queries
const ALLOWED_ORDER_BY_COLUMNS = ['id', 'title', 'author', 'price', 'pages']
const ALLOWED_ORDER_DIRECTIONS = ['ASC', 'DESC']

/**
 * 1. GET /books/
 * Query parameters:
 *  - search_q: partial match on title using LIKE (default: "")
 *  - order_by: column name (default: "id")
 *  - order: sort direction "ASC" or "DESC" (default: "ASC")
 *  - limit: number of records (default: 10)
 *  - offset: offset for pagination (default: 0)
 *  - min_price: minimum price filter
 *  - max_price: maximum price filter
 */
app.get('/books/', async (request, response) => {
  try {
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price,
    } = request.query

    // Validate order_by column to prevent SQL injection
    const normalizedOrderBy = order_by.toLowerCase()
    if (!ALLOWED_ORDER_BY_COLUMNS.includes(normalizedOrderBy)) {
      return response.status(400).json({
        message: `Invalid order_by field. Allowed values: ${ALLOWED_ORDER_BY_COLUMNS.join(', ')}.`,
      })
    }

    // Validate sort direction
    const normalizedOrder = order.toUpperCase()
    if (!ALLOWED_ORDER_DIRECTIONS.includes(normalizedOrder)) {
      return response.status(400).json({
        message: `Invalid order direction. Allowed values: ${ALLOWED_ORDER_DIRECTIONS.join(', ')}.`,
      })
    }

    // Validate and parse limit and offset
    const parsedLimit = parseInt(limit, 10)
    const parsedOffset = parseInt(offset, 10)

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return response.status(400).json({
        message: "Invalid limit: 'limit' must be a positive integer.",
      })
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return response.status(400).json({
        message: "Invalid offset: 'offset' must be a non-negative integer.",
      })
    }

    // Build WHERE clause using parameterized conditions
    const conditions = ['title LIKE ?']
    const params = [`%${search_q}%`]

    // Price range filter
    if (min_price !== undefined && max_price !== undefined) {
      const min = Number(min_price)
      const max = Number(max_price)
      if (isNaN(min) || isNaN(max)) {
        return response.status(400).json({
          message: 'Invalid price range: min_price and max_price must be numbers.',
        })
      }
      if (min > max) {
        return response.status(400).json({
          message: 'Invalid price range: min_price cannot be greater than max_price.',
        })
      }
      conditions.push('price BETWEEN ? AND ?')
      params.push(min, max)
    } else if (min_price !== undefined) {
      const min = Number(min_price)
      if (isNaN(min)) {
        return response.status(400).json({
          message: "Invalid min_price: 'min_price' must be a number.",
        })
      }
      conditions.push('price >= ?')
      params.push(min)
    } else if (max_price !== undefined) {
      const max = Number(max_price)
      if (isNaN(max)) {
        return response.status(400).json({
          message: "Invalid max_price: 'max_price' must be a number.",
        })
      }
      conditions.push('price <= ?')
      params.push(max)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const getBooksQuery = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${normalizedOrderBy} ${normalizedOrder}
      LIMIT ? OFFSET ?;
    `
    params.push(parsedLimit, parsedOffset)

    const books = await db.all(getBooksQuery, params)
    response.status(200).json(books)
  } catch (error) {
    console.error('Error retrieving books:', error.message)
    response.status(500).json({ message: 'Internal Server Error: Unable to retrieve books.' })
  }
})

/**
 * 2. GET /books/:bookId/
 * Retrieve a single book by ID
 */
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])

    if (!book) {
      return response.status(404).json({ message: 'Book not found.' })
    }

    response.status(200).json(book)
  } catch (error) {
    console.error('Error retrieving book:', error.message)
    response.status(500).json({ message: 'Internal Server Error: Unable to retrieve the book.' })
  }
})

/**
 * 3. POST /books/
 * Create a new book
 * Validates:
 *  - title is non-empty string
 *  - author is non-empty string
 *  - price is numeric and non-negative
 */
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body

    // Validation for missing or invalid title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return response.status(400).json({
        message: "Validation Error: 'title' is required and must be a non-empty string.",
      })
    }

    // Validation for missing or invalid author
    if (!author || typeof author !== 'string' || !author.trim()) {
      return response.status(400).json({
        message: "Validation Error: 'author' is required and must be a non-empty string.",
      })
    }

    // Validation for missing or non-numeric price
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return response.status(400).json({
        message: "Validation Error: 'price' is required and must be a valid non-negative number.",
      })
    }

    // Validation for optional pages
    let parsedPages = null
    if (pages !== undefined && pages !== null) {
      parsedPages = parseInt(pages, 10)
      if (isNaN(parsedPages) || parsedPages < 0) {
        return response.status(400).json({
          message: "Validation Error: 'pages' must be a valid positive integer if provided.",
        })
      }
    }

    const insertBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `
    const result = await db.run(insertBookQuery, [
      title.trim(),
      author.trim(),
      Number(price),
      parsedPages,
    ])

    response.status(201).json({
      message: 'Book added successfully.',
      bookId: result.lastID,
    })
  } catch (error) {
    console.error('Error adding book:', error.message)
    response.status(500).json({ message: 'Internal Server Error: Unable to add the book.' })
  }
})

/**
 * 4. PUT /books/:bookId/
 * Update an existing book's details
 */
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const { title, author, price, pages } = request.body

    // Check if book exists first
    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
    if (!existingBook) {
      return response.status(404).json({ message: 'Book not found.' })
    }

    // Validation
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return response.status(400).json({
        message: "Validation Error: 'title' must be a non-empty string.",
      })
    }

    if (author !== undefined && (typeof author !== 'string' || !author.trim())) {
      return response.status(400).json({
        message: "Validation Error: 'author' must be a non-empty string.",
      })
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return response.status(400).json({
        message: "Validation Error: 'price' must be a valid non-negative number.",
      })
    }

    const updatedTitle = title !== undefined ? title.trim() : existingBook.title
    const updatedAuthor = author !== undefined ? author.trim() : existingBook.author
    const updatedPrice = price !== undefined ? Number(price) : existingBook.price
    const updatedPages = pages !== undefined ? parseInt(pages, 10) : existingBook.pages

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `
    await db.run(updateBookQuery, [updatedTitle, updatedAuthor, updatedPrice, updatedPages, bookId])

    response.status(200).json({ message: 'Book updated successfully.' })
  } catch (error) {
    console.error('Error updating book:', error.message)
    response.status(500).json({ message: 'Internal Server Error: Unable to update the book.' })
  }
})

/**
 * 5. DELETE /books/:bookId/
 * Delete a book by ID
 */
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId])

    if (result.changes === 0) {
      return response.status(404).json({ message: 'Book not found.' })
    }

    response.status(200).json({ message: 'Book deleted successfully.' })
  } catch (error) {
    console.error('Error deleting book:', error.message)
    response.status(500).json({ message: 'Internal Server Error: Unable to delete the book.' })
  }
})

// Database and Server Initialization
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Ensure table exists on startup
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER
      );
    `)

    const server = app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`)
    })

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use (EADDRINUSE). Please choose another port or terminate the existing process.`)
      } else {
        console.error('Server error:', error.message)
      }
    })
  } catch (error) {
    console.error(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

module.exports = app
