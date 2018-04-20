let appConfig = {
    protocol: 'http://',
    host: '192.168.1.12',
    port: process.env.NODE_APP_PORT || 3000,
    saltRounds: 15,
    secretKey: "X1t(01?G449042l",
    resetCodeLength: 12,
    addHours: 1
}

let dbConfig = {
    connection: 'mongodb://192.168.1.12:27017/nodeRestApi'
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