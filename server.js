const http = require('http');
const app = require('./app');
const config = require('./config');

const host = config.host;
const port = config.port;

<<<<<<< HEAD
http.createServer(app).listen(3000);
=======
http.createServer(app).listen(port, host);

console.log("Running APP on port: ", port);
>>>>>>> fea952b5882b5022bfb425c0091026061a121463
