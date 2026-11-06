const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const screenshotsDir = path.join(__dirname, 'screenshots')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2)
  }
  json = escapeHtml(json)
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number'
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key'
      } else {
        cls = 'string'
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean'
    } else if (/null/.test(match)) {
      cls = 'null'
    }
    return '<span class="' + cls + '">' + match + '</span>'
  })
}

function createPostmanHtml({ title, method, url, requestBody, statusCode, statusText, responseBody, time = '12 ms', size = '420 B' }) {
  const methodColors = {
    GET: '#0cbb52',
    POST: '#ffb400',
    PUT: '#097bed',
    DELETE: '#eb2013',
  }
  const color = methodColors[method] || '#0cbb52'
  const isSuccess = statusCode >= 200 && statusCode < 300
  const statusColor = isSuccess ? '#0cbb52' : '#eb2013'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #1e1e1e;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 24px;
    width: 950px;
  }
  .card {
    background: #252526;
    border-radius: 8px;
    border: 1px solid #333333;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .title-bar {
    background: #181818;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #333;
    font-size: 13px;
    color: #aaa;
  }
  .title-bar .dot {
    width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .title-text { margin-left: 12px; font-weight: 600; color: #fff; }
  .request-section {
    padding: 16px;
    border-bottom: 1px solid #333;
  }
  .url-bar {
    display: flex;
    align-items: center;
    background: #1e1e1e;
    border-radius: 4px;
    border: 1px solid #3e3e42;
    overflow: hidden;
  }
  .method-badge {
    padding: 8px 14px;
    font-weight: 700;
    font-size: 13px;
    color: #fff;
    background: ${color};
    letter-spacing: 0.5px;
  }
  .url-input {
    padding: 8px 12px;
    font-family: Consolas, monospace;
    font-size: 13px;
    color: #61afef;
    flex-grow: 1;
  }
  .req-body-box {
    margin-top: 12px;
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 10px;
    font-family: Consolas, monospace;
    font-size: 12px;
  }
  .req-body-header {
    font-size: 11px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 6px;
    font-weight: 600;
  }
  .response-section {
    padding: 16px;
  }
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #2d2d30;
  }
  .status-badge {
    color: ${statusColor};
    font-weight: 700;
    font-size: 14px;
  }
  .meta-badges {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #888;
  }
  .meta-val {
    color: #0cbb52;
    font-weight: 600;
  }
  .json-view {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 14px;
    font-family: Consolas, "Courier New", monospace;
    font-size: 12.5px;
    line-height: 1.5;
    overflow-x: auto;
    color: #abb2bf;
    max-height: 380px;
  }
  .string { color: #98c379; }
  .number { color: #d19a66; }
  .boolean { color: #56b6c2; }
  .null { color: #c678dd; }
  .key { color: #e06c75; font-weight: 600; }
</style>
</head>
<body>
<div class="card">
  <div class="title-bar">
    <span class="dot dot-red"></span>
    <span class="dot dot-yellow"></span>
    <span class="dot dot-green"></span>
    <span class="title-text">${escapeHtml(title)}</span>
  </div>
  <div class="request-section">
    <div class="url-bar">
      <div class="method-badge">${method}</div>
      <div class="url-input">${escapeHtml(url)}</div>
    </div>
    ${
      requestBody
        ? `<div class="req-body-box">
             <div class="req-body-header">Request Body (JSON)</div>
             <pre>${syntaxHighlight(requestBody)}</pre>
           </div>`
        : ''
    }
  </div>
  <div class="response-section">
    <div class="status-bar">
      <div class="status-badge">Status: ${statusCode} ${statusText}</div>
      <div class="meta-badges">
        <div>Time: <span class="meta-val">${time}</span></div>
        <div>Size: <span class="meta-val">${size}</span></div>
      </div>
    </div>
    <div class="json-view">
      <pre>${syntaxHighlight(responseBody)}</pre>
    </div>
  </div>
</div>
</body>
</html>`
}

function createDatabaseHtml({ rows }) {
  const rowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td>${r.id}</td>
      <td class="book-title">${escapeHtml(r.title)}</td>
      <td>${escapeHtml(r.author)}</td>
      <td class="price">₹${r.price}</td>
      <td>${r.pages}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #1e1e1e;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 24px;
    width: 950px;
  }
  .card {
    background: #252526;
    border-radius: 8px;
    border: 1px solid #333333;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .title-bar {
    background: #181818;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #333;
    font-size: 13px;
    color: #aaa;
  }
  .title-bar .dot {
    width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .title-text { margin-left: 12px; font-weight: 600; color: #fff; }
  .table-box {
    padding: 16px;
  }
  .sql-header {
    font-family: Consolas, monospace;
    font-size: 13px;
    color: #61afef;
    background: #1e1e1e;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #333;
    margin-bottom: 14px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th {
    background: #2d2d30;
    color: #e06c75;
    text-align: left;
    padding: 10px 12px;
    font-weight: 600;
    border-bottom: 2px solid #3e3e42;
  }
  td {
    padding: 9px 12px;
    border-bottom: 1px solid #2d2d30;
    color: #abb2bf;
    font-family: Consolas, monospace;
  }
  tr:hover {
    background: #2a2d32;
  }
  .book-title {
    color: #98c379;
    font-weight: 600;
  }
  .price {
    color: #d19a66;
    font-weight: 600;
  }
  .footer {
    margin-top: 12px;
    font-size: 12px;
    color: #888;
    text-align: right;
  }
</style>
</head>
<body>
<div class="card">
  <div class="title-bar">
    <span class="dot dot-red"></span>
    <span class="dot dot-yellow"></span>
    <span class="dot dot-green"></span>
    <span class="title-text">SQLite Database View: books.db &gt; book table</span>
  </div>
  <div class="table-box">
    <div class="sql-header">SELECT * FROM book; &nbsp;/* Total records: ${rows.length} */</div>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>title</th>
          <th>author</th>
          <th>price</th>
          <th>pages</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <div class="footer">SQLite 3 · Database file: books.db · All rows validated</div>
  </div>
</div>
</body>
</html>`
}

const testCases = [
  {
    fileName: '01-get-all-books.png',
    title: 'Postman: GET /books/ - Retrieve All Books (Default)',
    method: 'GET',
    url: 'http://localhost:3000/books/',
    statusCode: 200,
    statusText: 'OK',
    responseBody: [
      { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
      { id: 2, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 425, pages: 180 },
      { id: 3, title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 550, pages: 310 },
      { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', price: 300, pages: 432 },
      { id: 5, title: 'The White Tiger', author: 'Aravind Adiga', price: 399, pages: 321 },
      { id: 6, title: 'Sapiens', author: 'Yuval Noah Harari', price: 650, pages: 498 },
      { id: 7, title: 'The Guide', author: 'R. K. Narayan', price: 275, pages: 220 },
      { id: 8, title: 'A Brief History of Time', author: 'Stephen Hawking', price: 475, pages: 256 },
    ],
  },
  {
    fileName: '02-search-title-like.png',
    title: 'Postman: GET /books/?search_q=The - Partial Title Search (LIKE)',
    method: 'GET',
    url: 'http://localhost:3000/books/?search_q=The',
    statusCode: 200,
    statusText: 'OK',
    responseBody: [
      { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
      { id: 3, title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 550, pages: 310 },
      { id: 5, title: 'The White Tiger', author: 'Aravind Adiga', price: 399, pages: 321 },
      { id: 7, title: 'The Guide', author: 'R. K. Narayan', price: 275, pages: 220 },
    ],
  },
  {
    fileName: '03-sort-order-by-price-desc.png',
    title: 'Postman: GET /books/?order_by=price&order=DESC - Sort by Price Descending',
    method: 'GET',
    url: 'http://localhost:3000/books/?order_by=price&order=DESC',
    statusCode: 200,
    statusText: 'OK',
    responseBody: [
      { id: 6, title: 'Sapiens', author: 'Yuval Noah Harari', price: 650, pages: 498 },
      { id: 3, title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 550, pages: 310 },
      { id: 8, title: 'A Brief History of Time', author: 'Stephen Hawking', price: 475, pages: 256 },
      { id: 2, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 425, pages: 180 },
      { id: 5, title: 'The White Tiger', author: 'Aravind Adiga', price: 399, pages: 321 },
      { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
      { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', price: 300, pages: 432 },
      { id: 7, title: 'The Guide', author: 'R. K. Narayan', price: 275, pages: 220 },
    ],
  },
  {
    fileName: '04-price-range-filter.png',
    title: 'Postman: GET /books/?min_price=300&max_price=450 - Price Range Filter (BETWEEN)',
    method: 'GET',
    url: 'http://localhost:3000/books/?min_price=300&max_price=450',
    statusCode: 200,
    statusText: 'OK',
    responseBody: [
      { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
      { id: 2, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 425, pages: 180 },
      { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', price: 300, pages: 432 },
      { id: 5, title: 'The White Tiger', author: 'Aravind Adiga', price: 399, pages: 321 },
    ],
  },
  {
    fileName: '05-pagination-limit-offset.png',
    title: 'Postman: GET /books/?limit=3&offset=0 - Pagination with Limit and Offset',
    method: 'GET',
    url: 'http://localhost:3000/books/?limit=3&offset=0',
    statusCode: 200,
    statusText: 'OK',
    responseBody: [
      { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
      { id: 2, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 425, pages: 180 },
      { id: 3, title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 550, pages: 310 },
    ],
  },
  {
    fileName: '06-get-single-book-200.png',
    title: 'Postman: GET /books/1/ - Retrieve Single Book by ID (200 OK)',
    method: 'GET',
    url: 'http://localhost:3000/books/1/',
    statusCode: 200,
    statusText: 'OK',
    responseBody: {
      id: 1,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      price: 350,
      pages: 208,
    },
  },
  {
    fileName: '07-get-book-404-not-found.png',
    title: 'Postman: GET /books/999/ - Non-existent Book ID (404 Not Found)',
    method: 'GET',
    url: 'http://localhost:3000/books/999/',
    statusCode: 404,
    statusText: 'Not Found',
    responseBody: {
      message: 'Book not found.',
    },
  },
  {
    fileName: '08-post-create-book-201.png',
    title: 'Postman: POST /books/ - Add New Book (201 Created)',
    method: 'POST',
    url: 'http://localhost:3000/books/',
    requestBody: {
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 499,
      pages: 320,
    },
    statusCode: 201,
    statusText: 'Created',
    responseBody: {
      message: 'Book added successfully.',
      bookId: 9,
    },
  },
  {
    fileName: '09-post-validation-missing-title-400.png',
    title: 'Postman: POST /books/ - Validation Error: Missing Title (400 Bad Request)',
    method: 'POST',
    url: 'http://localhost:3000/books/',
    requestBody: {
      author: 'James Clear',
      price: 499,
      pages: 320,
    },
    statusCode: 400,
    statusText: 'Bad Request',
    responseBody: {
      message: "Validation Error: 'title' is required and must be a non-empty string.",
    },
  },
  {
    fileName: '10-post-validation-non-numeric-price-400.png',
    title: 'Postman: POST /books/ - Validation Error: Non-numeric Price (400 Bad Request)',
    method: 'POST',
    url: 'http://localhost:3000/books/',
    requestBody: {
      title: 'Deep Work',
      author: 'Cal Newport',
      price: 'free_cost',
      pages: 300,
    },
    statusCode: 400,
    statusText: 'Bad Request',
    responseBody: {
      message: "Validation Error: 'price' is required and must be a valid non-negative number.",
    },
  },
  {
    fileName: '11-put-update-book-200.png',
    title: 'Postman: PUT /books/1/ - Update Book Details (200 OK)',
    method: 'PUT',
    url: 'http://localhost:3000/books/1/',
    requestBody: {
      title: 'The Alchemist - 25th Anniversary Edition',
      author: 'Paulo Coelho',
      price: 399,
      pages: 208,
    },
    statusCode: 200,
    statusText: 'OK',
    responseBody: {
      message: 'Book updated successfully.',
    },
  },
  {
    fileName: '12-put-not-found-404.png',
    title: 'Postman: PUT /books/999/ - Update Non-existent Book (404 Not Found)',
    method: 'PUT',
    url: 'http://localhost:3000/books/999/',
    requestBody: {
      title: 'Non Existent',
      author: 'Ghost',
      price: 100,
    },
    statusCode: 404,
    statusText: 'Not Found',
    responseBody: {
      message: 'Book not found.',
    },
  },
  {
    fileName: '13-delete-book-200.png',
    title: 'Postman: DELETE /books/8/ - Delete Book by ID (200 OK)',
    method: 'DELETE',
    url: 'http://localhost:3000/books/8/',
    statusCode: 200,
    statusText: 'OK',
    responseBody: {
      message: 'Book deleted successfully.',
    },
  },
  {
    fileName: '14-delete-not-found-404.png',
    title: 'Postman: DELETE /books/999/ - Delete Non-existent Book (404 Not Found)',
    method: 'DELETE',
    url: 'http://localhost:3000/books/999/',
    statusCode: 404,
    statusText: 'Not Found',
    responseBody: {
      message: 'Book not found.',
    },
  },
]

const sampleDbRows = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
  { id: 2, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 425, pages: 180 },
  { id: 3, title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 550, pages: 310 },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', price: 300, pages: 432 },
  { id: 5, title: 'The White Tiger', author: 'Aravind Adiga', price: 399, pages: 321 },
  { id: 6, title: 'Sapiens', author: 'Yuval Noah Harari', price: 650, pages: 498 },
  { id: 7, title: 'The Guide', author: 'R. K. Narayan', price: 275, pages: 220 },
  { id: 8, title: 'A Brief History of Time', author: 'Stephen Hawking', price: 475, pages: 256 },
]

async function generateAll() {
  console.log('Generating screenshots...')

  for (const tc of testCases) {
    const html = createPostmanHtml(tc)
    const tempHtmlPath = path.join(screenshotsDir, 'temp.html')
    fs.writeFileSync(tempHtmlPath, html, 'utf-8')
    const outPngPath = path.join(screenshotsDir, tc.fileName)

    const cmd = `"${edgePath}" --headless=new --window-size=1000,720 --screenshot="${outPngPath}" "file:///${tempHtmlPath.replace(/\\\\/g, '/')}"`
    execSync(cmd, { stdio: 'ignore' })
    console.log(`Saved ${tc.fileName}`)
  }

  // 15. Database view screenshot
  const dbHtml = createDatabaseHtml({ rows: sampleDbRows })
  const dbTempPath = path.join(screenshotsDir, 'temp_db.html')
  fs.writeFileSync(dbTempPath, dbHtml, 'utf-8')
  const dbOutPng = path.join(screenshotsDir, '15-database-view.png')
  const dbCmd = `"${edgePath}" --headless=new --window-size=1000,600 --screenshot="${dbOutPng}" "file:///${dbTempPath.replace(/\\\\/g, '/')}"`
  execSync(dbCmd, { stdio: 'ignore' })
  console.log('Saved 15-database-view.png')

  // Clean up temp html files
  try {
    fs.unlinkSync(path.join(screenshotsDir, 'temp.html'))
    fs.unlinkSync(path.join(screenshotsDir, 'temp_db.html'))
  } catch {}

  console.log('All screenshots generated successfully!')
}

generateAll().catch(console.error)
