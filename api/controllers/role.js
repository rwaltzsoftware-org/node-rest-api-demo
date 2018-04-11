const Role = require('../models/role');
const Joi = require('joi');
const config = require('../../config');

/*  Possible Routes  */

const RequestUrl = function () {
    return {
        'list': {
            "url": config.baseUrl + 'roles',
            "method": "GET",
        },
        'details': {
            "url": config.baseUrl + 'roles',
            "method": "GET",
        },
        'create': {
            "url": config.baseUrl + 'roles',
            "method": "POST",
        },
        'update': {
            "url": config.baseUrl + 'roles',
            "method": "PUT",
        },
        'delete': {
            "url": config.baseUrl + 'roles',
            "method": "DELETE",
        },
    };
};


let Controller = {};

Controller.listing = (request, response) => {
    Role.find()
        .exec()
        .then((data) => {
            let preparedData = data.map((tmpData) => {

                /* Add Role Id to Url  */
                let tmpRequestData = new RequestUrl();
                tmpRequestData.details.url = tmpRequestData.details.url + '/' + tmpData._id;

                return {
                    _id: tmpData._id,
                    name: tmpData.name,
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                };
            });

            let responseData = {
                count: preparedData.length,
                data: preparedData
            };

            return response.status(200).json(responseData);
        })
        .catch((error) => {
            return response.status(500).json({
                'error': error.message
            });
        });

};

Controller.details = (request, response) => {
    Role.findOne({
        _id: request.params.roleId
    })
        .exec()
        .then((data) => {
            if (!data) {
                return response.status(500).json({
                    'message': 'Role Not Found'
                });
            }

            let tmpRequestData = new RequestUrl();
            tmpRequestData.delete.url = tmpRequestData.delete.url + '/' + data._id;
            tmpRequestData.update.url = tmpRequestData.update.url + '/' + data._id;

            delete tmpRequestData.details;
            delete tmpRequestData.create;

            let responseData = {
                _id: data._id,
                name: data.name,
                requests: tmpRequestData
            };

            return response.status(200).json(responseData);
        })
        .catch((error) => {
            return response.status(500).json({
                'error': error.message
            });
        });

};

Controller.create = (request, response) => {
    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
    });

    if (validate.error) {
        return response.status(500).json({
            'message': validate.error.details[0].message
        });
    }

    /*  Check Duplication  */
    Role.findOne({
        name: request.body.name,
    })
        .then((data) => {
            return new Promise((resolve, reject) => {
                if (data) {
                    const error = new Error("Role Already Exists");
                    error.status = 500;

                    reject(error);
                } else {
                    resolve();
                }
            });
        })
        .then(() => {

            /* Create New Role */
            const role = new Role({
                name: request.body.name
            });

            return role.save()
                .then((data) => {
                    /* Add Role Id to Url  */
                    let tmpRequestData = new RequestUrl();
                    tmpRequestData.details.url = tmpRequestData.details.url + '/' + role._id;

                    return response
                        .status(201)
                        .json({
                            message: "Role Created Succesfuly",
                            requests: [{
                                'details': tmpRequestData.details
                            }]
                        });
                });
        })
        .catch((error) => {
            return response
                .status(500)
                .json({
                    message: error.message
                });
        });
};

Controller.update = (request, response) => {

    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
    });

    if (validate.error) {
        return response.status(500).json({
            'message': validate.error.details[0].message
        });
    }

    /*  Check Duplication  */
    Role.findOne({
        name: request.body.name,
        _id: {
            $ne: request.params.roleId
        }
    })
        .then((data) => {
            return new Promise((resolve, reject) => {
                if (data) {
                    const error = new Error("Role Already Exists");
                    error.status = 500;

                    reject(error);
                } else {
                    resolve();
                }
            });
        })
        .then(() => {
            /* Update Role */
            const role = {
                name: request.body.name
            };

            let updateCriteria = { _id: request.params.roleId };
            let updateData = { $set: role };

            return Role.update(updateCriteria, updateData)
                .exec()
                .then((data) => {

                    let tmpRequestData = new RequestUrl();
                    tmpRequestData.details.url = tmpRequestData.details.url + '/' + role._id;

                    return response
                        .status(200)
                        .json({
                            message: "Role Updated Succesfuly",
                            requests: [{
                                'details': tmpRequestData.details
                            }]
                        });
                });
        })
        .catch((error) => {
            return response
                .status(500)
                .json({
                    message: error.message
                });
        });
};

Controller.delete = (request, response) => {

    Role.deleteOne({
        _id: request.params.roleId
    })
        .exec()
        .then((data) => {

            return response
                .status(200)
                .json({
                    message: "Role Deleted Succesfuly",
                    requests: []
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    message: error.message
                });
        });
};

module.exports = Controller;