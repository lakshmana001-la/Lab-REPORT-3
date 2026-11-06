# Lab 3: REST API, query parameters, validation, debugging

**Name:** MENDA LAKSHMANARAO · **Registration number:** 252U1R5100 · **Section:** AIDE 2B  
**Course:** Backend Development Fundamentals · Year II Term II · Aurora  
**Faculty:** Joel Prashanth D  

---

## Live Link

**Live link:** Not applicable (Local SQLite development environment; deployed public cloud hosting requires persistent cloud volume database mounting; full Postman test suite results and execution proofs are provided below for every endpoint).

---

## Objective

Turn the Lab 2 routes into a clean REST API with search, sorting, filtering, validation, consistent status codes and response formatting, and practice debugging common backend errors.

---

## How to Run

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Installation
Clone the repository and navigate into the `lab-03` directory:
```bash
cd lab-03
npm install
```

### 2. Environment Variables
Create an optional `.env` file in the `lab-03/` root directory (do not commit this file):
```env
PORT=3000
```
*Note: If no `PORT` variable is set, the server defaults to port `3000`.*

### 3. Initialize / Seed the Database
To create the SQLite database (`books.db`) with the `book` table and sample data:
```bash
npm run init-db
```

### 4. Start the Application
- **Production start:**
  ```bash
  npm start
  ```
- **Development start (with hot reload via Nodemon):**
  ```bash
  npm run dev
  ```

---

## Endpoints / Scripts Table

| Method | Path | Description | Success Status | Error Status |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/books/` | Retrieve all books with optional query parameters (`search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price`) | `200 OK` | `400 Bad Request` |
| `GET` | `/books/:bookId/` | Retrieve a single book record by its unique ID | `200 OK` | `404 Not Found` |
| `POST` | `/books/` | Create a new book record with body validation (`title`, `author`, `price`) | `201 Created` | `400 Bad Request` |
| `PUT` | `/books/:bookId/` | Update existing book details with body validation | `200 OK` | `400 / 404 Not Found` |
| `DELETE` | `/books/:bookId/` | Remove a book record by ID | `200 OK` | `404 Not Found` |

### Query Parameters for `GET /books/`

| Parameter | Type | Default | Description |
| :--- | :--- | :---: | :--- |
| `search_q` | String | `""` | Partial title match using SQL `LIKE %search_q%` |
| `order_by` | String | `id` | Column to sort by (`id`, `title`, `author`, `price`, `pages`) |
| `order` | String | `ASC` | Sort order direction (`ASC` or `DESC`) |
| `limit` | Integer | `10` | Maximum number of records to return |
| `offset` | Integer | `0` | Number of records to skip for pagination |
| `min_price`| Number | *None* | Minimum book price filter (`price >= min_price`) |
| `max_price`| Number | *None* | Maximum book price filter (`price <= max_price` or `BETWEEN`) |

---

## Screenshots

### 1. Database View
![SQLite Database View](screenshots/15-database-view.png)

### 2. GET All Books (Default)
![GET All Books](screenshots/01-get-all-books.png)

### 3. GET Search Books by Partial Title (`search_q=The`)
![Search Books by Title](screenshots/02-search-title-like.png)

### 4. GET Sort Books by Price Descending (`order_by=price&order=DESC`)
![Sort Books by Price](screenshots/03-sort-order-by-price-desc.png)

### 5. GET Price Range Filter (`min_price=300&max_price=450`)
![Price Range Filter](screenshots/04-price-range-filter.png)

### 6. GET Pagination with Limit & Offset (`limit=3&offset=0`)
![Pagination Limit Offset](screenshots/05-pagination-limit-offset.png)

### 7. GET Single Book by ID (Success)
![GET Single Book](screenshots/06-get-single-book-200.png)

### 8. GET Book Not Found (`404`)
![GET Book 404 Not Found](screenshots/07-get-book-404-not-found.png)

### 9. POST Create Book (`201 Created`)
![POST Create Book](screenshots/08-post-create-book-201.png)

### 10. POST Validation Failure: Missing Title (`400 Bad Request`)
![POST Missing Title Error](screenshots/09-post-validation-missing-title-400.png)

### 11. POST Validation Failure: Non-Numeric Price (`400 Bad Request`)
![POST Non-Numeric Price Error](screenshots/10-post-validation-non-numeric-price-400.png)

### 12. PUT Update Book Details (`200 OK`)
![PUT Update Book](screenshots/11-put-update-book-200.png)

### 13. PUT Non-existent Book ID (`404 Not Found`)
![PUT Book 404 Not Found](screenshots/12-put-not-found-404.png)

### 14. DELETE Book by ID (`200 OK`)
![DELETE Book](screenshots/13-delete-book-200.png)

### 15. DELETE Non-existent Book ID (`404 Not Found`)
![DELETE Book 404 Not Found](screenshots/14-delete-not-found-404.png)

---

## Notes: Problems Faced and How You Solved Them

### Debugging Exercises Analysis

1. **Port Conflict (`EADDRINUSE`)**:
   - **Problem:** Attempting to start the Express server when another instance or background process is already bound to port 3000 caused Node.js to throw `Error: listen EADDRINUSE: address already in use :::3000`.
   - **Solution:** Configured `const port = process.env.PORT || 3000` to allow dynamic port selection. Added an error event listener on the server instance `server.on('error', ...)` to gracefully detect `EADDRINUSE` and prompt the developer, or freed port 3000 using PowerShell commands (`Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process`).

2. **Wrong Import Path**:
   - **Problem:** Incorrect relative path when importing SQLite or database initialization files (e.g., `require('./book.db')` instead of using `path.join(__dirname, 'books.db')`, or incorrect driver import for `open`).
   - **Solution:** Standardized path resolution using Node's built-in `path.join(__dirname, 'books.db')` to ensure cross-platform compatibility across Windows and Linux, and imported `{ open }` from `sqlite` alongside `sqlite3.Database`.

3. **Table-Name Typo (`no such table`)**:
   - **Problem:** Queries failed with `SQLITE_ERROR: no such table: books` because the table definition was named `book` (singular) while queries inadvertently referenced `books` (plural).
   - **Solution:** Unified the schema and query definitions across all routes to consistently reference the table `book`, and added an automatic `CREATE TABLE IF NOT EXISTS book (...)` during server initialization to guarantee the table exists before incoming requests.

4. **Missing `await`**:
   - **Problem:** Calling asynchronous database operations (e.g., `db.all()`, `db.get()`, or `db.run()`) without the `await` keyword returned an unresolved Promise instead of query results, resulting in empty responses or premature response dispatch.
   - **Solution:** Marked all route handler callbacks as `async` and strictly ensured every database interaction (`await db.all(...)`, `await db.get(...)`, `await db.run(...)`) is properly awaited before constructing and sending the HTTP JSON response.

5. **SQL Injection Prevention on Dynamic Clauses**:
   - **Problem:** While SQL values can be bound with `?`, SQL keywords and column identifiers (such as `ORDER BY column ASC/DESC`) cannot be parameterized directly with `?` in SQLite.
   - **Solution:** Implemented strict whitelist validation. The server checks `order_by` against `['id', 'title', 'author', 'price', 'pages']` and `order` against `['ASC', 'DESC']`. Any unauthorized inputs are rejected with `400 Bad Request`. All user query values (`search_q`, `min_price`, `max_price`, `limit`, `offset`) are parameterized using positional `?` placeholders.

---

## Viva Questions & Answers

### 1. Query parameter vs path parameter?
- **Path parameters** (e.g., `/books/:bookId/`) are part of the URL path hierarchy and are used to uniquely identify a specific resource.
- **Query parameters** (e.g., `/books/?search_q=The&order_by=price`) are appended after the `?` delimiter in key-value pairs and are used to filter, sort, search, or paginate a collection of resources without altering the resource path.

### 2. What does stateless mean in REST?
- **Statelessness** means that each HTTP request from a client to a server must contain all the information necessary to understand and process the request. The server does not store any client session context between requests. This improves scalability, reliability, and cacheability.

### 3. Which status code for bad input vs a missing record?
- **Bad Input:** `400 Bad Request` is returned when client input fails syntax or validation checks (e.g., missing required fields, non-numeric price, or invalid query options).
- **Missing Record:** `404 Not Found` is returned when the request is syntactically valid, but the target resource ID does not exist in the database.
