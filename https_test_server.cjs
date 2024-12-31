const https = require('https');
const { Buffer } = require('node:buffer');
const fs  = require('fs');

// SBS (Signature Base String) is the body of the POST request
let dataToSend = 'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttps%253A%252F%252Fregits2501.github.io%252FQuoteOwlet%252F%253Fdata%253Dquote%25253DIf%25252520you%25252520break%25252520your%25252520neck%2525252C%25252520if%25252520you%25252520have%25252520nothing%25252520to%25252520eat%2525252C%25252520if%25252520your%25252520house%25252520is%25252520on%25252520fire%2525252C%25252520then%25252520you%25252520got%25252520a%25252520problem.%25252520%25252520Everything%25252520else%25252520is%25252520inconvenience.%252526author%25253DRobert%25252520Fulghum%252526userName%25253Dguest%26oauth_consumer_key%3DY7sgJ9Ihks7ViejyT3saTSP6L%26oauth_nonce%3DWjZQSWJtUTd2VG1Vc1ZWdFpzWkVUS2dnWU5GdEh1NA%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1735640198%26oauth_version%3D1.0'

let options = {
  hostname: 'api.twitter.com',
  port: 443,
  path: '/oauth/request_token',
  method: 'POST',

  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
     'Content-Length': `${Buffer.byteLength(dataToSend, 'utf8')}`,
    // AH (Authorization Header String)
    'Authorization': 'OAuth oauth_callback="https%3A%2F%2Fregits2501.github.io%2FQuoteOwlet%2F%3Fdata%3Dquote%253DIf%252520you%252520break%252520your%252520neck%25252C%252520if%252520you%252520have%252520nothing%252520to%252520eat%25252C%252520if%252520your%252520house%252520is%252520on%252520fire%25252C%252520then%252520you%252520got%252520a%252520problem.%252520%252520Everything%252520else%252520is%252520inconvenience.%2526author%253DRobert%252520Fulghum%2526userName%253Dguest", oauth_consumer_key="Y7sgJ9Ihks7ViejyT3saTSP6L", oauth_nonce="WjZQSWJtUTd2VG1Vc1ZWdFpzWkVUS2dnWU5GdEh1NA", oauth_signature="%2BFt%2BTvGSfrI1xGPT9h6RO3gQYcU%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1735640198", oauth_version="1.0"'
  },

  // key: fs.readFileSync('encription/private-key.pem'),
  // cert: fs.readFileSync('encription/certificate.pem')       // can be self signed certificate
};


let request = https.request(options, (response) => {
  response.on('data', (chunk) => {
    console.log('Response Message:', chunk.toString());
    //console.log(' =====> Response:', response)
  });

  response.on('error', (err) => {
    console.log('Error:', err)
  })
});

// Log the request body
console.log('Request body:', dataToSend);

// Write data to the request body
request.write(dataToSend);

request.end();