const http = require('http');

const hostname = '0.0.0.0'; // Listen on all available network interfaces
const port = 8080; // The port your application will listen on

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from Node.js on Google Cloud Run!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
