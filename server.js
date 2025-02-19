import xwizServer from 'xwiz-server';
import express from 'express'
import * as fs from 'fs';
import CORS from './src/network/CORS.js';

// IMport deps for /proxy route
import {
    getClientAddress,
    throttleRate,
    processRequest,
    proxyConfig
} from './src/proxy/Proxy.js'

const app = express();

let key;
let cert;

// TODO move loading keys to separete module
try {

    key = process.env.HTTPS_KEY || fs.readFileSync('encription/private-key.pem')
    cert = process.env.HTTPS_CERT || fs.readFileSync('encription/certificate.pem')

} catch (err) {
    console.error("Unable to load KEY and CERT: ", error)
}

console.log("HTTPS_KEY: ", key)
console.log("HTTPS_CERT: ", cert);

console.log(`KEY: ${process.env.CONSUMER_KEY} \nSECRET: ${process.env.CONSUMER_SECRET}`);

const xwizer = xwizServer({

    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
})



/*
    proxy route ,can be used for any kind of proxy, 
    here used for going to a random quotes server
*/
app.use('/proxy', (req, res) => {
    console.log('in /getquote: url', req.url)
    const clientIP = getClientAddress(req);
    req.clientIP = clientIP;

    if (proxyConfig.enable_logging) {
        console.log(`${new Date().toJSON()} ${clientIP} ${req.method} ${req.url}`);
    }

    if (proxyConfig.enable_rate_limiting) {

        throttleRate.rateLimit(clientIP, (err, limited) => {
            console.log('throtleRate.rateLimit')
            if (limited) {
                return writeResponse(res, 429, "Enhance your calm");
            }

            processRequest(req, res);
        });
    } else {
        processRequest(req, res);
    }
});

/////////////////////////////////////////////////////////////////////////////////////

// CORS first part - in preflight set what is allowed for the root ('/')
app.options('*', (req, res) => {
    console.log('CORS 1 (firstpart) \n');

    const cors = new CORS(req, res, {
        allow: {
            origin: req.headers.origin,
            methods: 'POST, GET, HEAD',
            headers: 'content-type, Authorization, Allow'
        }
    });

    cors.prefligh(); // send preflight resposnse
});

// CORS second part - set acccess-control-allow-origin
app.use('*', (req, res, next) => {

    console.log('CORS 2 (second) part \n')

    const cors = new CORS(req, res);

    cors.setAccessControlHeaders({
        allow: {
            origin: req.headers.origin
        }
    });

    next();  // call nex middl. function (don't flush response)
})

app.use('/xwiz-server', xwizer);                                          // use the xwiz-server

app.on('hasteOrOAuth', async function (xwiz, verifyCredentials) { // event where we pick haste or oauth
    console.log('event :: "hasteOrOAuth"')

    try {  

        // Go for access token in your database, if found go for verifyCredentials() --> xwiz.haste()
         if (!accessToken) throw "User's access token not found";

        let credentials = await verifyCredentials(accessToken, { skip_status: true })
        console.log('credentails ==::::==> ', credentials);

        xwiz.haste(accessToken)   // Gets a api data end sends back to browser

    } catch (err) {
        
        console.log('continueOAuth')
        // When you don't have access token (or don't want to use haste) you hit complete 3 leg OAuth flow
        xwiz.continueOAuth();
    }
})

app.on('tokenFound', async function (token, xwiz) { // When oauth process is finished you get the user' access token 

    xwiz.onEnd(async function setUserName(apiData, res) {
        // set screen_name (user name)

        apiData.screen_name = (await token).screen_name;
        console.log(' ======> xwiz.onEnd(): apiData: ', apiData) // accessToken.screen_name

        res.setHeader('Content-Type', 'application/json');

        res.end(JSON.stringify(apiData));
    })

    try {
        
        let accessToken = await token; // user's access token received from X which you can put in database
        console.log('event:: tokenFound " token:', accessToken);

    } catch (err) {
        console.log(`TokenFound error: ${err}`)
    }


})

let port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`\n Starting quote-owlet-xwiz-server: PORT = ${port} `);
})
