const http = require('http')

const BASE_URL = 'http://localhost:3000'

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })

    req.on('error', reject)
    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function runTests() {
  let res = await request('GET', '/books/')
  console.log('GET /books/: Status', res.status, '| Count:', res.body.length)

  res = await request('GET', '/books/?search_q=the')
  console.log('GET /books/?search_q=the: Status', res.status, '| Count:', res.body.length)

  res = await request('GET', '/books/?order_by=price&order=DESC&limit=4')
  console.log('GET /books/?order_by=price&order=DESC&limit=4: Status', res.status, '| Books:', res.body.map(b => b.title))

  res = await request('GET', '/books/?min_price=300&max_price=600')
  console.log('GET /books/?min_price=300&max_price=600: Status', res.status, '| Count:', res.body.length)

  res = await request('GET', '/books/1/')
  console.log('GET /books/1/: Status', res.status, '| Title:', res.body.title)

  res = await request('GET', '/books/999/')
  console.log('GET /books/999/: Status', res.status, '| Message:', res.body.message)

  res = await request('POST', '/books/', {
    title: 'Deep Work',
    author: 'Cal Newport',
    price: 499,
    pages: 304,
  })
  console.log('POST /books/: Status', res.status, '| Body:', res.body)

  res = await request('POST', '/books/', {
    author: 'Cal Newport',
    price: 499,
  })
  console.log('POST missing title: Status', res.status, '| Message:', res.body.message)

  res = await request('POST', '/books/', {
    title: 'Deep Work',
    author: 'Cal Newport',
    price: 'invalid',
  })
  console.log('POST non-numeric price: Status', res.status, '| Message:', res.body.message)

  res = await request('PUT', '/books/1/', {
    title: 'The Alchemist - 25th Anniversary Edition',
    author: 'Paulo Coelho',
    price: 399,
    pages: 208,
  })
  console.log('PUT /books/1/: Status', res.status, '| Message:', res.body.message)

  res = await request('PUT', '/books/999/', {
    title: 'Ghost',
    author: 'Unknown',
    price: 100,
  })
  console.log('PUT /books/999/: Status', res.status, '| Message:', res.body.message)

  res = await request('DELETE', '/books/10/')
  console.log('DELETE /books/10/: Status', res.status, '| Message:', res.body.message)

  res = await request('DELETE', '/books/999/')
  console.log('DELETE /books/999/: Status', res.status, '| Message:', res.body.message)
}

runTests().catch(console.error)
