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
  console.log('--- STARTING COMPREHENSIVE LAB 3 API TESTS ---\n')

  // 1. GET /books/ default
  let res = await request('GET', '/books/')
  console.log('1. GET /books/ (Default list): Status', res.status, '| Count:', res.body.length)

  // 2. GET /books/?search_q=The
  res = await request('GET', '/books/?search_q=The')
  console.log('2. GET /books/?search_q=The (Search): Status', res.status, '| Books:', res.body.map(b => b.title))

  // 3. GET /books/?order_by=price&order=DESC
  res = await request('GET', '/books/?order_by=price&order=DESC')
  console.log('3. GET /books/?order_by=price&order=DESC (Sort DESC): Status', res.status, '| Top price:', res.body[0].price)

  // 4. GET /books/?min_price=300&max_price=450
  res = await request('GET', '/books/?min_price=300&max_price=450')
  console.log('4. GET /books/?min_price=300&max_price=450 (Price Range): Status', res.status, '| Count:', res.body.length)

  // 5. GET /books/?limit=2&offset=0
  res = await request('GET', '/books/?limit=2&offset=0')
  console.log('5. GET /books/?limit=2&offset=0 (Pagination): Status', res.status, '| Count:', res.body.length)

  // 6. GET /books/1/
  res = await request('GET', '/books/1/')
  console.log('6. GET /books/1/ (Single Book): Status', res.status, '| Title:', res.body.title)

  // 7. GET /books/999/ (Not Found)
  res = await request('GET', '/books/999/')
  console.log('7. GET /books/999/ (404 Test): Status', res.status, '| Message:', res.body.message)

  // 8. POST /books/ (Create Success)
  res = await request('POST', '/books/', {
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 499,
    pages: 320,
  })
  console.log('8. POST /books/ (Create 201): Status', res.status, '| Body:', res.body)

  // 9. POST /books/ (Validation Failure: Missing Title)
  res = await request('POST', '/books/', {
    author: 'James Clear',
    price: 499,
  })
  console.log('9. POST /books/ (Missing Title 400): Status', res.status, '| Message:', res.body.message)

  // 10. POST /books/ (Validation Failure: Non-numeric Price)
  res = await request('POST', '/books/', {
    title: 'Deep Work',
    author: 'Cal Newport',
    price: 'not_a_number',
  })
  console.log('10. POST /books/ (Non-numeric Price 400): Status', res.status, '| Message:', res.body.message)

  // 11. PUT /books/1/ (Update Success)
  res = await request('PUT', '/books/1/', {
    title: 'The Alchemist - 25th Anniversary',
    author: 'Paulo Coelho',
    price: 399,
    pages: 208,
  })
  console.log('11. PUT /books/1/ (Update 200): Status', res.status, '| Message:', res.body.message)

  // 12. PUT /books/999/ (Update 404)
  res = await request('PUT', '/books/999/', {
    title: 'Missing',
    author: 'Ghost',
    price: 100,
  })
  console.log('12. PUT /books/999/ (Update 404): Status', res.status, '| Message:', res.body.message)

  // 13. DELETE /books/8/ (Delete Success)
  res = await request('DELETE', '/books/8/')
  console.log('13. DELETE /books/8/ (Delete 200): Status', res.status, '| Message:', res.body.message)

  // 14. DELETE /books/999/ (Delete 404)
  res = await request('DELETE', '/books/999/')
  console.log('14. DELETE /books/999/ (Delete 404): Status', res.status, '| Message:', res.body.message)

  console.log('\n--- ALL TEST CASES EXECUTED SUCCESSFULLY ---')
}

runTests().catch(console.error)
