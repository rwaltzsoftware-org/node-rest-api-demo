const fs = require('fs');
const Joi = require('joi');
const Category = require('../models/category');
const config = require('../../config');

const moduleName = config.routeSlug.category;

/*  Possible Routes  */
const RequestUrl = function () {
    return {
        'list': {
            "url": config.baseUrl + moduleName,
            "method": "GET",
        },
        'details': {
            "url": config.baseUrl + moduleName,
            "method": "GET",
        },
        'create': {
            "url": config.baseUrl + moduleName,
            "method": "POST",
        },
        'update': {
            "url": config.baseUrl + moduleName,
            "method": "PUT",
        },
        'delete': {
            "url": config.baseUrl + moduleName,
            "method": "DELETE",
        },
    };
}

let Controller = {};


/* Controller - Category Add */
Controller.store = (request, response, next) => {

    /* validation */
    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
        description: Joi.any(),
        image: Joi.any()
    });

    if (validate.error) {
        return response.status(500)
            .json({
                message: validate.error.details[0].message
            });
    }

    /* Check Category Name Duplication */
    Category.findOne({
            name: request.body.name
        })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result) {
                    /* Removed category image if duplication found */
                    if(fs.existsSync(request.file.path))
                    {
                        fs.unlinkSync(request.file.path);
                    }
                    reject({
                        message: 'Category with this name already present'
                    });
                } else {
                    resolve();
                }
            })
        })
        .then(() => {
            /* Insert Category Records */
            const categorySave = new Category({
                'name': request.body.name,
                'image': request.file.path,
                'description': request.body.description
            });


            categorySave.save()
                .then(result => {
                    let temRequestData = new RequestUrl();
                    temRequestData.details.url = temRequestData.details.url + '/' + result._id;


                    response.status(201)
                        .json({
                            message: 'Category added successfully',
                            requests: [{
                                'details': temRequestData.details
                            }]
                        })
                })
                .catch(error => {
                    response.status(500)
                        .json({
                            message: 'Error while adding Category',
                            Error: error
                        })
                });
        })
        .catch(err => {
            return response.status(500)
                .json({
                    error: err
                })
        });
};

/* Controller - Get Specific Data using Id */
Controller.get = (request, response, next) => {
    const id = request.params.categoryID;

    Category.findById({
            _id: id
        })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result === null) {
                    reject({
                        message: 'Can not found any category with this ID'
                    });
                } else {
                    resolve(result);
                }
            });
        })
        .then((result) => {
            let temRequestData = new RequestUrl();
            temRequestData.delete.url = temRequestData.delete.url + '/' + id;

            let responseData = {
                id: result._id,
                name: result.name,
                description: result.description,
                filePath: config.baseUrl + result.image
            };

            response.status(200)
                .json({
                    message: 'Result get successfully',
                    data: responseData,
                    requests: [{
                        'delete': temRequestData.delete
                    }]
                })
        })
        .catch(err => {
            if (err.name === 'CastError') {
                err = {
                    message: 'Inccorect Category ID, Please check'
                }
            }

            response.status(500)
                .json({
                    error: err
                })
        });
};

/* Controller - Update Category */
Controller.update = (request, response, next) => {
    const id = request.params.categoryID;

    /* validation */
    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
        description: Joi.any(),
        image: Joi.any()
    });

    if (validate.error) {
        return response.status(500)
            .json({
                message: validate.error.details[0].message
            });
    }

    Category.findOne({
            name: request.body.name
        })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result) {
                    reject({
                        message: 'Category already present with same name'
                    });
                } else {
                    resolve();
                }
            });
        })
        .then(()=>{
            return Category.findOne({
                _id: id
            })
            .exec();
        })
        .then((category) => 
        {
            if(!category)
            {
                return response.status(500)
                    .json({
                        error: "Category Does not Exists "
                    });
            }

            const categoryObj = {};

            for (tmp in request.body) {
                categoryObj[tmp] = request.body[tmp];
            }

            let updateCriteria = {
                _id: id
            }

            let updateData = {
                $set: categoryObj
            }

            Category.update(updateCriteria, updateData)
                .then(result => {
                    const temRequestData = new RequestUrl();
                    temRequestData.details.url = temRequestData.details.url + '/' + id;

                    response.status(200)
                        .json({
                            message: 'Category Update Successfully',
                            requests: [{
                                'details': temRequestData.details
                            }]
                        })
                })
                .catch(err => {
                    response.status(500)
                        .json({
                            error: err
                        })
                })
        })
        .catch(err => {
            response.status(500)
                .json({
                    error: err
                });
        });
};

/* Controller - Getting All Categories */
Controller.getAll = (request, response, next) => {
    Category.find()
        .exec()
        .then(result => {
            let preparedData = result.map((tmpData) => {

                /* Add User Id to Url  */
                let tmpRequestData = new RequestUrl();
                tmpRequestData.details.url = tmpRequestData.details.url + '/' + tmpData._id;

                return {
                    _id: tmpData._id,
                    name: tmpData.name,
                    description: tmpData.description,
                    image: config.baseUrl + tmpData.image,
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                }
            });

            let responseData = {
                count: preparedData.length,
                data: preparedData
            };

            response.status(200)
                .json({
                    message: 'Data get successfully',
                    data: responseData
                });
        })
        .catch(error => {
            response.status(500)
                .json({
                    Error: error
                });
        });
};


/* Controller - Delete Catgory */
Controller.delete = (request, response, next) => {
    const id = request.params.categoryID;

    Category.findOne({
        _id: id
    })
    .exec()
    .then((result)=>{
        return new Promise((resolve,reject)=>{
            if(result){
                resolve(result);
            }else{
                reject({
                    message : 'Category does not exists'
                });
            }
        });
    })
    .then((result) => {
        Category.remove({
                _id: id
            })
            .exec()
            .then(result => {
                response.status(200)
                    .json({
                        message: 'Category Deleted Successfully'
                    });
            })
            .catch(err => {
                response.status(500)
                    .json({
                        error: err
                    });
            });
    })
    .catch(err => {
        response.status(500)
            .json({
                error: err
            });
    });
            
};

module.exports = Controller;