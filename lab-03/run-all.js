const { spawn } = require('child_process')

const serverProcess = spawn('node', ['app.js'], {
  cwd: __dirname,
  stdio: 'inherit',
})

setTimeout(() => {
  const testProcess = spawn('node', ['test-api.js'], {
    cwd: __dirname,
    stdio: 'inherit',
  })

  testProcess.on('close', (code) => {
    serverProcess.kill('SIGINT')
    process.exit(code)
  })
}, 1500)
