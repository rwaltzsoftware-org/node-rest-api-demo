const http = require('http');
const app = require('./app');

const port = process.env.NODE_APP_PORT || 3000;

http.createServer(app).listen(3000);