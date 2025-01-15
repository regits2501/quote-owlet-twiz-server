import axios from 'axios';

const encodedParams = new URLSearchParams('', 'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttps%253A%252F%252Fregits2501.github.io%252FQuoteOwlet%252F%253Fdata%253Dquote%25253DThey%25252520say%25252520the%25252520owlet%25252520brings%25252520wisdom%252526author%25253DTrough%25252520random%25252520quotes%252526userName%25253Dguest%26oauth_consumer_key%3DR3LRZ7msGAFM3hk0ONSQ4GcMN%26oauth_nonce%3DdUh4aW1XdUZWWUNwNmRJTHQ1aUhHVkdEZkVwZEpIUA%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1735724064%26oauth_version%3D1.0');

console.log('encodedParams', encodedParams);

const options = {
  method: 'POST',
  url: 'https://api.twitter.com/oauth/request_token',
  headers: {
    authorization: 'OAuth oauth_callback="https%3A%2F%2Fregits2501.github.io%2FQuoteOwlet%2F%3Fdata%3Dquote%253DThey%252520say%252520the%252520owlet%252520brings%252520wisdom%2526author%253DTrough%252520random%252520quotes%2526userName%253Dguest", oauth_consumer_key="R3LRZ7msGAFM3hk0ONSQ4GcMN", oauth_nonce="dUh4aW1XdUZWWUNwNmRJTHQ1aUhHVkdEZkVwZEpIUA", oauth_signature="a%2FCVzfVKs%2FtW06E0JJEK9fUvMHg%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1735724064", oauth_version="1.0"',
    'content-type': 'application/x-www-form-urlencoded'
  },
  data: encodedParams,
};

try {
    const { data } = await axios.request(options);
    console.log(data);
} catch (error) {
    console.error(error);
}