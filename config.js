let appConfig = {
    protocol : 'http://',
    host: 'localhost',
    port: process.env.NODE_APP_PORT || 3000,
    saltRounds: 15,
    secretKey: "X1t(01?G449042l",
    resetCodeLength: 12,
    addHours: 1
}

appConfig.baseUrl = appConfig.protocol + appConfig.host + ":" +appConfig.port + '/' ;

module.exports = appConfig;