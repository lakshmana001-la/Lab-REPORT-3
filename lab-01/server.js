const express = require('express')
const app = express()

const PORT = 3000

// Home route
app.get('/', (request, response) => {
  response.status(200).send('Welcome to my Node.js and Express server!')
})

// About route
app.get('/about', (request, response) => {
  response.status(200).json({
    name: 'Namrata',
    section: 'AI/DE-2B'
  })
})

// Time route
app.get('/time', (request, response) => {
  response.status(200).json({ time: new Date() })
})

// Handle requests for routes that do not exist.
app.use((request, response) => {
  response.status(404).send('404 - Page Not Found')
})

app.listen(PORT, () => {
  console.log(`Express server is running at http://localhost:${PORT}`)
})
