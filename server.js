const http = require('http');
const app = require('./app');
const config = require('./config');

const host = config.host;
const port = config.port;

http.createServer(app).listen(port, host);

console.log("Running APP on port: ", port);