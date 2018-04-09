const express = require('express');
const router = express.Router();
const User = require('../models/user');

const config = require('../../config');

/*  Possible Routes  */

const RequestUrl = function () {
    return {
        'list': {
            "url": config.baseUrl + 'users',
            "method": "GET",
        },
        'details': {
            "url": config.baseUrl + 'users',
            "method": "GET",
        },
        'create': {
            "url": config.baseUrl + 'users',
            "method": "POST",
        },
        'update': {
            "url": config.baseUrl + 'users',
            "method": "PUT",
        },
        'delete': {
            "url": config.baseUrl + 'users',
            "method": "DELETE",
        },
    };
}



/*  Listing  */
router.get('/', (request, response) => {
    User.find()
        .populate()
        .exec()
        .then((data) => {
            let preparedData = data.map((tmpData) => {

                /* Add User Id to Url  */
                let tmpRequestData = new RequestUrl();
                tmpRequestData.details.url = tmpRequestData.details.url + '/' + tmpData._id;

                return {
                    _id: tmpData._id,
                    name: tmpData.name,
                    email: tmpData.email,
                    roles: tmpData.roles,
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                }
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

});

/*  Details  */
router.get('/:userId', (request, response) => {
    User.findOne({
        _id: request.params.userId
        })
        .exec()
        .then((data) => {
            let tmpRequestData = new RequestUrl();
            tmpRequestData.delete.url = tmpRequestData.delete.url + '/' + data._id;
            tmpRequestData.update.url = tmpRequestData.update.url + '/' + data._id;

            delete tmpRequestData.details;
            delete tmpRequestData.create;

            let responseData = {
                _id: data._id,
                name: data.name,
                email: data.email,
                roles: data.roles,
                requests: tmpRequestData
            }

            return response.status(200).json(responseData);
        })
        .catch((error) => {
            return response.status(500).json({
                'error': error.message
            });
        });

});

/*  Create  */
router.post('/', (request, response) => 
{
    /*  Check Duplication  */
    User.findOne({
            email: request.body.email,
        })
        .then((data) => {
            if (data) {
                return response
                    .status(500)
                    .json({
                        message: "User Already Exists"
                    });
            }
        })
        .catch((error) => {
            return response
                .status(500)
                .json({
                    message: error.message
                });
        });

    /* Create New Role */    
    const user = new User({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        roles: request.body.roles,
    });

    user.save()
        .then((data) => {
            /* Add User Id to Url  */
            let tmpRequestData = new RequestUrl();
            tmpRequestData.details.url = tmpRequestData.details.url + '/' + user._id;

            return response
                .status(201)
                .json({
                    message: "User Created Succesfuly",
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    status: 'failure',
                    message: error.message
                });
        })

});

/*  Edit  */
router.put('/:userId', (request, response) => {
   
    /*  Check Duplication  */
    User.findOne({
            email: request.body.email,
            _id: {
                $ne: request.params.userId
            }
        })
        .then((data) => {
            if (data) {
                return response
                    .status(500)
                    .json({
                        message: "User with same Email Already Exists"
                    });
            }
        })
        .catch((error) => {
            return response
                .status(500)
                .json({
                    message: error.message
                });
        });

    /* Update Role */
    const user = {}


    for(tmp in request.body)
    {
        user[tmp] = request.body[tmp];
    }


    User.update({
            _id: request.params.userId
        }, {
            $set: user
        })
        .exec()
        .then((data) => {

            let tmpRequestData = new RequestUrl();
            tmpRequestData.details.url = tmpRequestData.details.url + '/' + data._id;

            return response
                .status(200)
                .json({
                    message: "User Updated Succesfuly",
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    message: error.message
                });
        })
});

/*  Delete  */
router.delete('/:userId', (request, response) => {

    User.deleteOne({
            _id: request.params.userId
        })
        .exec()
        .then((data) => {

            return response
                .status(200)
                .json({
                    message: "User Deleted Succesfuly",
                    requests: []
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    message: error.message
                });
        })
});

module.exports = router;