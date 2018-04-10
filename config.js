let appConfig = {
    protocol : 'http://',
    host: 'localhost',
    port: process.env.NODE_APP_PORT || 3000
}

appConfig.baseUrl = appConfig.protocol + appConfig.host + ":" +appConfig.port + '/' ;

module.exports = appConfig;