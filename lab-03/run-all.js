const { spawn } = require('child_process')
const path = require('path')

const serverProcess = spawn('node', ['app.js'], {
  cwd: __dirname,
  stdio: 'inherit',
})

// Wait 1.5 seconds for server to start, then run tests
setTimeout(() => {
  const testProcess = spawn('node', ['test-api.js'], {
    cwd: __dirname,
    stdio: 'inherit',
  })

  testProcess.on('close', (code) => {
    console.log(`Tests exited with code ${code}`)
    serverProcess.kill('SIGINT')
    process.exit(code)
  })
}, 1500)
