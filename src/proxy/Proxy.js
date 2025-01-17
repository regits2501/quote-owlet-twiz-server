import http from 'http';
import https from 'https';
import url from 'url';
import request from 'request';
import publicAddressFinder from 'public-address';
import * as config from './config.js';
import throttle from 'tokenthrottle';
import cluster from 'cluster';

const throttleRate = throttle({ rate: config.max_requests_per_second });

let publicIP;

// Get our public IP address
publicAddressFinder((err, data) => {
    if (!err && data) {
        publicIP = data.address;
    }
});

// Middleware to add CORS headers
const addCORSHeaders = (req, res) => {
    if (req.method.toUpperCase() === "OPTIONS") {
        if (req.headers["access-control-request-headers"]) {
            res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
        }
        if (req.headers["access-control-request-method"]) {
            res.setHeader("Access-Control-Allow-Methods", req.headers["access-control-request-method"]);
        }
    }

    const origin = req.headers["origin"] || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
};

// Helper to write response
const writeResponse = (res, httpCode, body = '') => {
    res.status(httpCode).send(body);
};

// Handle invalid URL format
const sendInvalidURLResponse = (res) => {
    return writeResponse(res, 404, "URL must be in the form of /proxy/{some_url_here}");
};

// Handle request exceeding size limit
const sendTooBigResponse = (res) => {
    return writeResponse(res, 413, `The content in the request or response cannot exceed ${config.max_request_length} characters.`);
};

// Get client IP address
const getClientAddress = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
};

// Proxy handling logic
const processRequest = (req, res) => { console.log('processRequest()')
    addCORSHeaders(req, res);

    // Return options pre-flight requests right away
    if (req.method.toUpperCase() === "OPTIONS") {
        return writeResponse(res, 204);
    }

    const result = config.fetch_regex.exec(req.url);

    if (result && result.length === 2 && result[1]) {
        let remoteURL;
        try {
            console.log('beforeParsing url')
            remoteURL = url.parse(decodeURI(result[1]));

            console.log('remoteURl:', remoteURL)
        } catch (e) {
            return sendInvalidURLResponse(res);
        }

        // Check if URL is valid and not a relative link
        if (!remoteURL.host) {
            return writeResponse(res, 404, "Relative URLs are not supported");
        }

        // Deny blacklisted hosts
        if (config.blacklist_hostname_regex.test(remoteURL.hostname)) {
            return writeResponse(res, 400, "Naughty, naughty...");
        }

        // Only support http and https
        if (remoteURL.protocol !== "http:" && remoteURL.protocol !== "https:") {
            return writeResponse(res, 400, "Only http and https are supported");
        }

        // Add our public IP to the X-Forwarded-For header
        if (publicIP) {
            req.headers["x-forwarded-for"] = req.headers["x-forwarded-for"] 
                ? `${req.headers["x-forwarded-for"]}, ${publicIP}` 
                : `${req.clientIP}, ${publicIP}`;
        }

        // Update the host header
        if (req.headers["host"]) {
            req.headers["host"] = remoteURL.host;
        }

        // Remove origin and referer headers
        delete req.headers["origin"];
        delete req.headers["referer"];

        const proxyRequest = request({
            url: remoteURL,
            headers: req.headers,
            method: req.method,
            timeout: config.proxy_request_timeout_ms,
            strictSSL: false
        });

        proxyRequest.on('error', (err) => {
            if (err.code === "ENOTFOUND") {
                return writeResponse(res, 502, `Host for ${url.format(remoteURL)} cannot be found.`);
            } else {
                console.log(`Proxy Request Error (${url.format(remoteURL)}): ${err.toString()}`);
                return writeResponse(res, 500);
            }
        });

        let requestSize = 0;
        let proxyResponseSize = 0;

        req.pipe(proxyRequest).on('data', (data) => {
            requestSize += data.length;
            if (requestSize >= config.max_request_length) {
                proxyRequest.end();
                return sendTooBigResponse(res);
            }
        }).on('error', () => {
            writeResponse(res, 500, "Stream Error");
        });

        proxyRequest.pipe(res).on('data', (data) => {
            proxyResponseSize += data.length;
            if (proxyResponseSize >= config.max_request_length) {
                proxyRequest.end();
                return sendTooBigResponse(res);
            }
        }).on('error', () => {
            writeResponse(res, 500, "Stream Error");
        });
    } else {
        return sendInvalidURLResponse(res);
    }
};

export {
    getClientAddress,
    throttleRate,
    processRequest,
    config as proxyConfig

}