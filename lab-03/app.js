const path = require('path')
const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const app = express()
const port = process.env.PORT || 3000
const dbPath = path.join(__dirname, 'books.db')

let db = null

app.use(express.json())

const ALLOWED_ORDER_BY = ['id', 'title', 'author', 'price', 'pages']
const ALLOWED_ORDER = ['ASC', 'DESC']

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

    const safeOrderBy = ALLOWED_ORDER_BY.includes(order_by.toLowerCase())
      ? order_by.toLowerCase()
      : 'id'
    const safeOrder = ALLOWED_ORDER.includes(order.toUpperCase())
      ? order.toUpperCase()
      : 'ASC'

    const parsedLimit = parseInt(limit, 10)
    const parsedOffset = parseInt(offset, 10)

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return response.status(400).json({ message: 'Invalid limit value' })
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return response.status(400).json({ message: 'Invalid offset value' })
    }

    const conditions = ['title LIKE ?']
    const params = [`%${search_q}%`]

    if (min_price !== undefined && max_price !== undefined) {
      const min = Number(min_price)
      const max = Number(max_price)
      if (isNaN(min) || isNaN(max)) {
        return response.status(400).json({ message: 'Invalid price range' })
      }
      conditions.push('price BETWEEN ? AND ?')
      params.push(min, max)
    } else if (min_price !== undefined) {
      const min = Number(min_price)
      if (isNaN(min)) {
        return response.status(400).json({ message: 'Invalid min_price' })
      }
      conditions.push('price >= ?')
      params.push(min)
    } else if (max_price !== undefined) {
      const max = Number(max_price)
      if (isNaN(max)) {
        return response.status(400).json({ message: 'Invalid max_price' })
      }
      conditions.push('price <= ?')
      params.push(max)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const getBooksQuery = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${safeOrderBy} ${safeOrder}
      LIMIT ? OFFSET ?;
    `
    params.push(parsedLimit, parsedOffset)

    const books = await db.all(getBooksQuery, params)
    response.status(200).json(books)
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' })
  }
})

app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])

    if (!book) {
      return response.status(404).json({ message: 'Book Not Found' })
    }

    response.status(200).json(book)
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' })
  }
})

app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return response.status(400).json({ message: 'Missing title' })
    }

    if (!author || typeof author !== 'string' || !author.trim()) {
      return response.status(400).json({ message: 'Missing author' })
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return response.status(400).json({ message: 'Invalid or missing price' })
    }

    const parsedPages = pages !== undefined && pages !== null ? parseInt(pages, 10) : 0
    if (isNaN(parsedPages) || parsedPages < 0) {
      return response.status(400).json({ message: 'Invalid pages value' })
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
      bookId: result.lastID,
      message: 'Book Added Successfully',
    })
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' })
  }
})

app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const { title, author, price, pages } = request.body

    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
    if (!existingBook) {
      return response.status(404).json({ message: 'Book Not Found' })
    }

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return response.status(400).json({ message: 'Invalid title' })
    }

    if (author !== undefined && (typeof author !== 'string' || !author.trim())) {
      return response.status(400).json({ message: 'Invalid author' })
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return response.status(400).json({ message: 'Invalid price' })
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

    response.status(200).json({ message: 'Book Updated Successfully' })
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' })
  }
})

app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
    if (!existingBook) {
      return response.status(404).json({ message: 'Book Not Found' })
    }

    await db.run('DELETE FROM book WHERE id = ?;', [bookId])
    response.status(200).json({ message: 'Book Deleted Successfully' })
  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' })
  }
})

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `)

    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`)
    })
  } catch (error) {
    console.error(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

module.exports = app
