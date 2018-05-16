# NodeJS Rest API Demo

This project demonstrate following points

- Implementation of REST API 
- Implementation of JWT Token
- Utlizing MongoDB for Data Storage 

Following are the modules covered to demonstrate skills:

- Authentication and Authorization 
- Users - CRUD Operation 
- Roles - CRUD Operation 
- Product - CRUD Operation
- Category - CRUD Operation

### Minimum Requrement

NodeJS: 9.x or above <br>
MongoDB: 3.6.X or above

### Installation Process

Run # <b>npm install</b> to install all dependancy 

### Project Configration  

In config.js

```
let appConfig = {
    protocol: 'http://',
    host: '192.168.1.11', // Listening Server Address 
    port: process.env.NODE_APP_PORT || 3000, // Listening Server Port 
    saltRounds: 15, // Used for JWT Token Generation
    secretKey: "X1t(01?G449042l", // Used for JWT Token Generation
    resetCodeLength: 12,
    addHours: 1
}

let dbConfig = {
    connection: 'mongodb://192.168.1.12:27017/nodeRestApi' // Mongo DB Connection String
}

let filePaths = {
    category: 'uploads/category',
    product: 'uploads/product',
    user: 'uploads/user',
}

let routeSlug = {
    category: 'categories',
    product: 'products',
    auth: 'auth',
    users: 'users',
    roles: 'roles'
}

appConfig.baseUrl = appConfig.protocol + appConfig.host + ":" + appConfig.port + '/';

appConfig.dbConfig = dbConfig;
appConfig.filePaths = filePaths;
appConfig.routeSlug = routeSlug;

module.exports = appConfig;
```



### To Run 
Run # <b> npm start </b>

### API Documentation 

<a href="https://documenter.getpostman.com/view/4119951/node-rest-api/RVu7DTNC" target="_blank"> Click Here </a>




