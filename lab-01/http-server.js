const http = require('http')

const PORT = 3000

// Create a basic server using Node.js's built-in HTTP module.
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Hello')
})

server.listen(PORT, () => {
  console.log(`HTTP server is running at http://localhost:${PORT}`)
})
