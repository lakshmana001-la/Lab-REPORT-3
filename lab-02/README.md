# Lab 2: SQLite Database and CRUD Routes

**Course:** Backend Development Fundamentals  
**Year / Term:** II, Term II  
**College:** Aurora  
**Faculty:** Joel Prashanth D

## Student Details

- **Name:** MENDA LAKSHMANARAO
- **Registration Number:** 252U1R5100
- **Section:** AIDE 2B

## Live Link

Deployment pending.

## Objective

Connect an Express server to a SQLite database and provide HTTP routes to create, read, update, and delete book records.

## Technologies Used

- Node.js
- Express.js
- SQLite
- `sqlite`
- `sqlite3`
- Nodemon
- Postman

## Project Structure

```text
lab-02/
├── app.js
├── books.db
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── screenshots/
    └── README.md
```

`node_modules/` is installed locally and is not included in the submission.

## Installation

Open a terminal in the `lab-02` folder and install the dependencies:

```bash
npm install
```

If needed, install the packages manually:

```bash
npm install express sqlite sqlite3
npm install --save-dev nodemon
```

The SQLite command-line program is separate from the Node.js packages. Install the SQLite CLI and make sure `sqlite3` is available on your PATH before following the database setup steps.

## How to Run

Start the development server:

```bash
npm run dev
```

Nodemon watches the project files and automatically restarts the server when code changes. The server runs at <http://localhost:3000>.

## SQLite CLI Setup

The SQLite CLI commands below create `books.db`, create the `book` table, and insert sample records. Run terminal commands at a PowerShell prompt and run SQL commands after the SQLite prompt (`sqlite>`).

1. In PowerShell, change to this project folder and open the database:

   ```powershell
   cd path\to\lab-02
   sqlite3 books.db
   ```

2. At the `sqlite>` prompt, create the table:

   ```sql
   CREATE TABLE IF NOT EXISTS book (
     id INTEGER PRIMARY KEY,
     title TEXT,
     author TEXT,
     price INTEGER,
     pages INTEGER
   );
   ```

3. Insert these sample books (SQL, at the `sqlite>` prompt):

   ```sql
   INSERT INTO book (title, author, price, pages) VALUES
     ('The Alchemist', 'Paulo Coelho', 350, 208),
     ('Wings of Fire', 'A. P. J. Abdul Kalam', 425, 180),
     ('The Hobbit', 'J. R. R. Tolkien', 550, 310),
     ('Pride and Prejudice', 'Jane Austen', 300, 432),
     ('The White Tiger', 'Aravind Adiga', 399, 321),
     ('Sapiens', 'Yuval Noah Harari', 650, 498),
     ('The Guide', 'R. K. Narayan', 275, 220),
     ('A Brief History of Time', 'Stephen Hawking', 475, 256);
   ```

   The rows are inserted when you execute this SQL in the SQLite CLI. If the sample rows have already been inserted, skip this step to avoid duplicates.

4. View all records (SQL, at the `sqlite>` prompt):

   ```sql
   SELECT * FROM book;
   ```

5. Exit the SQLite CLI (at the `sqlite>` prompt):

   ```text
   .exit
   ```

The application uses `books.db` in this folder. If you have an existing database without the sample rows, execute the table and insert commands above against this same file.

## API Endpoints

| Method | Path | Description | Success Status |
| ------ | ---- | ----------- | -------------- |
| GET | `/books/` | Get all books | 200 |
| GET | `/books/:bookId/` | Get one book by ID | 200 |
| POST | `/books/` | Add a book | 201 |
| PUT | `/books/:bookId/` | Replace a book's details | 200 |
| DELETE | `/books/:bookId/` | Delete a book | 200 |

For a book ID that does not exist, GET, PUT, and DELETE return `404` with a clear error message.

## Testing with Postman

Start the server with `npm run dev`, then send requests to `http://localhost:3000`:

1. **GET all books:** `GET http://localhost:3000/books/`
2. **GET one book:** `GET http://localhost:3000/books/1/`
3. **Add a book:** `POST http://localhost:3000/books/`. Select **Body → raw → JSON** and use:

   ```json
   {
     "title": "The New Book",
     "author": "Sample Author",
     "price": 450,
     "pages": 250
   }
   ```

4. **Update a book:** `PUT http://localhost:3000/books/1/`. Select **Body → raw → JSON** and use:

   ```json
   {
     "title": "Updated Book Title",
     "author": "Updated Author",
     "price": 600,
     "pages": 400
   }
   ```

5. **Delete a book:** `DELETE http://localhost:3000/books/1/`

The POST, PUT, and DELETE requests change the SQLite database. All user-provided SQL values are passed using `?` placeholders; this keeps input separate from the SQL command and helps prevent SQL injection.

## Example Request Bodies

### POST `/books/`

```json
{
  "title": "The New Book",
  "author": "Sample Author",
  "price": 450,
  "pages": 250
}
```

### PUT `/books/1/`

```json
{
  "title": "Updated Book Title",
  "author": "Updated Author",
  "price": 600,
  "pages": 400
}
```

## Screenshots

Replace these placeholders with your own Postman screenshots after testing. No screenshots are included yet.

### GET All Books

![GET All Books](screenshots/get-all-books.png)

### GET One Book

![GET One Book](screenshots/get-one-book.png)

### POST a Book

![POST a Book](screenshots/post-book.png)

### PUT a Book

![PUT a Book](screenshots/put-book.png)

### DELETE a Book

![DELETE a Book](screenshots/delete-book.png)

## Notes / Problems Faced

- **`sqlite3` is not recognized:** Install the SQLite CLI and add its folder to your PATH. The CLI is separate from the Node.js `sqlite3` package.
- **Port 3000 is already in use:** Stop the other program using that port, then run `npm run dev` again.
- **Request body is empty:** In Postman, choose **Body → raw → JSON** and ensure the server uses `app.use(express.json())`.
- **Database file path issues:** Run the app from this project, and keep `books.db` in the same folder as `app.js`.

## Viva Questions and Answers

### Why do we use `await` when opening the database?

Opening a database is asynchronous. `await` pauses this function until the connection finishes, so the server starts only after the database is ready.

### What is SQL injection and how do placeholders prevent it?

SQL injection is when malicious input changes the meaning of a SQL query. `?` placeholders keep user values separate from the SQL command.

### When is PUT used instead of POST?

POST is generally used to create a new resource. PUT is used to update an existing resource.
