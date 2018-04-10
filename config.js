let appConfig = {
    protocol : 'http://',
    host: 'localhost',
    port: process.env.NODE_APP_PORT || 3000,
}

let dbConfig = {
    connection: 'mongodb://192.168.1.12:27017/nodeRestApi'
}

let filePaths = {
    category: './uploads/category/'
}

let routeSlug = {
    category: 'categories'
}

appConfig.baseUrl = appConfig.protocol + appConfig.host + ":" +appConfig.port + '/' ;

appConfig.dbConfig = dbConfig;
appConfig.filePaths = filePaths;
appConfig.routeSlug = routeSlug;

module.exports = appConfig;