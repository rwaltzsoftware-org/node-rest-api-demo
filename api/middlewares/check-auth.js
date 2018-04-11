const jwt = require('jsonwebtoken');
const appConfig = require('../../config');

module.exports = (request, response, next) => {
    try {
        const token = request.headers.authorization.split(" ");
        if (token.length <= 0) {
            return response.status(401).json({
                message: 'Auth failed due to missing token'
            });
        }
        const decoded = jwt.verify(token[1], appConfig.secretKey);
        request.userData = decoded;

        next();
    } catch (error) {
        return response.status(401).json({
            message: 'Auth failed'
        });
    }
};