// Load local .env for developing
// import 'dotenv/config';

import twizServer from 'twiz-server';
import express from 'express'
import  * as fs  from 'fs';


const app = express();

// app.get('/', (req,res) => {
//     res.send('quote-owlet-twiz-server')
// })

console.log("KEY: ", process.env.CONSUMER_KEY)
console.log("SECRET: ", process.env.CONSUMER_SECRET)

const twizer = twizServer({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,

    key: fs.readFileSync('encription/private-key.pem'),
    cert: fs.readFileSync('encription/certificate.pem')       // can be self signed certificate
})


app.use(twizer);                                          // use the twiz-server

app.on('hasteOrOAuth', async function (twiz, verifyCredentials) { // event where we pick haste or oauth
    console.log('event :: "hasteOrOAuth"')

    try {

        // Go for access token in your database, if found go for verifyCredentials() --> twiz.haste()
        if (!accessToken) throw "User's access token not found";

        let credentials = await verifyCredentials(accessToken, { skip_status: true })
        twiz.haste(accessToken)   // Gets api data end sends back to browser

    } catch (err) {

        // When you don't have access token (or just don't want to use haste) you continue the oauth flow
        twiz.continueOAuth(); // All 3 legs are hit
    }
})

app.on('tokenFound', async function (token) { // When whole oauth process is finished you get the user' access token 
    console.log('event:: "tokenFound"')
    try {
        let accessToken = await token; // user's access token received from X which you can put in database
        console.log(`Token found - access token: ${accessToken}`)

    } catch (err) {
        console.log(`TokenFound error: ${err}`)
    }
})

let port = process.env.PORT || 5000;

app.listen( port, () => {
   console.log(`Starting quote-owlet-twiz-server: PORT = ${port} `);
})
