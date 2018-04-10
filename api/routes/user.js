const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const fs = require('fs');
const Joi = require('joi');

const appConfig = require('../../config');


/*  Upload Config  */
const storage = multer.diskStorage({
    destination: appConfig.filePaths.user,
    filename: (request, file, cb) => {
        const fileName = new Date().toISOString() + "-" + file.originalname;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (request, file, cb) => {
        const allowedMimeType = ["image/jpeg", "image/jpg"];
        if (allowedMimeType.indexOf(file.mimetype) == -1) {
            const error = new Error("Invalid file Uploaded");
            error.status = 500;
            cb(error, false);
        } else {
            cb(null, true);
        }
    }
});



/*  Possible Routes  */

const RequestUrl = function () {
    return {
        'list': {
            "url": appConfig.baseUrl + 'users',
            "method": "GET",
        },
        'details': {
            "url": appConfig.baseUrl + 'users',
            "method": "GET",
        },
        'create': {
            "url": appConfig.baseUrl + 'users',
            "method": "POST",
        },
        'update': {
            "url": appConfig.baseUrl + 'users',
            "method": "PUT",
        },
        'delete': {
            "url": appConfig.baseUrl + 'users',
            "method": "DELETE",
        },
    };
};



/*  Listing  */
router.get('/', (request, response) => {
    User.find()
        .populate('roles', 'name')
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
                    profileImage: tmpData.profileImage,
                    roles: tmpData.roles,
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
            return response.status(error.status || 500).json({
                'error': error.message
            });
        });

});

/*  Details  */
router.get('/:userId', (request, response) => {

    User.findOne({
            _id: request.params.userId
        })
        .populate('roles', 'name')
        .exec()
        .then((data) => 
        {
            if( !data )
            {
                return response.status(500).json({
                    'message': 'User Not Found'
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
                email: data.email,
                roles: data.roles,
                requests: tmpRequestData
            };

            return response.status(200).json(responseData);
        })
        .catch((error) => {
            return response.status(error.status || 500).json({
                'error': error.message
            });
        });

});

/*  Create  */
router.post('/', upload.single('profileImage'), (request, response) => 
{
    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        roles: Joi.any(),
        profileImage: Joi.any(),
    });

    if (validate.error) 
    {
        return response.status(500).json({
            'message': validate.error.details[0].message
        });
    }


    /*  Check Duplication  */
    User.findOne({
            email: request.body.email,
        })
        .then((data) => {
            return new Promise((resolve, reject) => {
                if (data) {
                    const error = new Error("User Already Exists");
                    error.status = 500;

                    if (fs.existsSync(request.file.path)) {
                        fs.unlinkSync(request.file.path);
                    }

                    reject(error);
                } else {
                    resolve();
                }
            });
        })
        .then(() => {
            /* Create New Role */
            const user = new User({
                name: request.body.name,
                email: request.body.email,
                password: request.body.password,
                roles: request.body.roles,
                profileImage: request.file.path
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
                });

        })
        .catch((error) => {
            return response
                .status(error.status || 500)
                .json({
                    message: error.message
                });
        });
});

/*  Edit  */
router.put('/:userId', upload.single('profileImage'), (request, response) => {

    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        roles: Joi.any(),
        profileImage: Joi.any(),
    });

    if (validate.error) {
        return response.status(500).json({
            'message': validate.error.details[0].message
        });
    }

    /*  Check Duplication  */
    User.findOne({
            email: request.body.email,
            _id: {
                $ne: request.params.userId
            }
        })
        .then((data) => {
            return new Promise((resolve, reject) => {
                if (data) {
                    const error = new Error("User with same Email Already Exists");
                    error.status = 500;

                    if (fs.existsSync(request.file)) {
                        fs.unlinkSync(request.file);
                    }

                    reject(error);
                } else {
                    resolve();
                }
            });

        })
        .then(() => {
            /* Update User */
            let user = {};
            for (let tmp in request.body) {
                user[tmp] = request.body[tmp];
            }

            if (request.file)
            {
                request.profileImage = request.file.path;
            }

            let updateCriteria = { _id: request.params.userId };
            let updateData = { $set: user };


            User.update(updateCriteria, updateData)
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
                });
        })
        .catch((error) => {
            return response
                .status(error.status || 500)
                .json({
                    message: error.message
                });
        });
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
        });
});

module.exports = router;