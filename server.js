import twizServer from 'twiz-server';
import express from 'express'
import  * as fs  from 'fs';
import cors from 'cors';



const app = express();



let key; 
let cert;

// TODO move loading keys to separete module
try {

    key =   process.env.HTTPS_KEY || fs.readFileSync('encription/private-key.pem')
    cert =  process.env.HTTPS_CERT || fs.readFileSync('encription/certificate.pem')

} catch (err) {
    console.error("Unable to load KEY and CERT: ", error)
}

console.log("HTTPS_KEY: ", key)
console.log("HTTPS_CERT: ", process.env.CONSUMER_SECRET)

const twizer = twizServer({

    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,

    key:  key,
    cert: cert
})

// app.options('*', ( req, res) => {

//     console.log('Options: reguest:', req)

// });

app.use(cors({
    headers: ['Content-Type'],
    methods: ['GET', 'POST']
}));

app.use(twizer);                                          // use the twiz-server

app.on('hasteOrOAuth', async function (twiz, verifyCredentials) { // event where we pick haste or oauth
    console.log('event :: "hasteOrOAuth"')

    try {

        // Go for access token in your database, if found go for verifyCredentials() --> twiz.haste()
        if (!accessToken) throw "User's access token not found";

        let credentials = await verifyCredentials(accessToken, { skip_status: true })
        twiz.haste(accessToken)   // Gets api data end sends back to browser

    } catch (err) {
        console.log('continureOAuth')
        // When you don't have access token (or don't want to use haste) you hit complete 3 leg OAuth flow
        twiz.continueOAuth()
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
   console.log(`\n Starting quote-owlet-twiz-server: PORT = ${port} `);
})
