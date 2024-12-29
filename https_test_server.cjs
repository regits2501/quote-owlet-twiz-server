const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

const privateKey = fs.readFileSync('encription/private-key.pem')
const certificate = fs.readFileSync('encription/certificate.pem');

const credentials = {
  key: privateKey,
  cert: certificate
};

https.createServer(credentials, app).listen(4000, () => {
  console.log('Server is running on HTTPS');
});

// Add your route definitions here
app.get('/', (req, res) => {
  res.send('Hello, secure world!');
});