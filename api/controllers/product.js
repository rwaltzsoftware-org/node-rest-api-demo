const fs = require('fs');
const Joi = require('joi');
const Product = require('../models/product');
const config = require('../../config');

const productFolder = './' + config.filePaths.product;
const moduleName = config.routeSlug.product;

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

/* Controller - Product Add */
Controller.store = (request, response, next) => {

    /* validation */
    const validate = Joi.validate(request.body, {
        name: Joi.string().required(),
        category: Joi.string().required(),
        description: Joi.any(),
        image: Joi.any()
    });

    if(validate.error){
        return response.status(500)
                        .json({
                            message: validate.error.details[0].message
                        });
    }

    /* Check Product Name Duplication */
    Product.findOne({
        name: request.body.name
    })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result) {
                    /* Removed Product image if duplication found */
                    if(fs.existsSync(request.file.path)){
                        fs.unlinkSync(request.file.path);
                    }
                    reject({ message: 'Product with this name already present' });
                } else {
                    resolve();
                }
            })
        })
        .then(() => {
            /* Insert Product Records */
            const productSave = new Product({
                'name': request.body.name,
                'image': request.file.path,
                'description': request.body.description,
                'category': request.body.category
            });


            productSave.save()
                .then(result => {
                    let temRequestData = new RequestUrl();
                    temRequestData.details.url = temRequestData.details.url + '/' + result._id;


                    response.status(201)
                        .json({
                            message: 'Product added successfully',
                            requests: [{
                                'details': temRequestData.details
                            }]
                        })
                })
                .catch(error => {
                    response.status(500)
                        .json({
                            message: 'Error while adding Product',
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
    const id = request.params.productID;

    Product.findById({
        _id: id
    })
        .populate('category', 'name image description')
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result === null) {
                    reject({ message: 'Can not found any Product with this ID' });
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
                category: result.category,
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
                    message: 'Inccorect Product ID, Please check'
                }
            }

            response.status(500)
                .json({
                    error: err
                })
        });
};

/* Controller - Update Product */
Controller.update = (request, response, next) => {
    const id = request.params.productID;

    /* validation */
    const validate = Joi.validate(request.body,{
        name: Joi.string().required(),
        category: Joi.string().required(),
        description: Joi.any(),
        image: Joi.any()
    })

    if(validate.error){
        return response.status(500)
                        .json({
                            message: validate.error.details[0].message
                        });
    }

    Product.findOne({
        name: request.body.name
    })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result) {
                    reject({ message: 'Product already present with same name' });
                } else {
                    resolve();
                }
            });
        })
        .then(() => {
            return Product.findOne({
                _id: id
            })
                .exec();
        })
        .then((product) => {

            if (!product) {
                return response.status(500)
                    .json({
                        error: "Product Does not Exists "
                    });
            }

            const productObj = {};

            for (tmp in request.body) {
                productObj[tmp] = request.body[tmp];
            }

            let updateCriteria = {
                _id: id
            }

            let updateData = {
                $set: productObj
            }

            Product.update(updateCriteria, updateData)
                .then(result => {
                    const temRequestData = new RequestUrl();
                    temRequestData.details.url = temRequestData.details.url + '/' + id;

                    response.status(200)
                        .json({
                            message: 'Product Update Successfully',
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

/* Controller - Getting All Produts */
Controller.getAll = (request, response, next) => {
    Product.find()
        .populate('category', 'name image description')
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
                    category: tmpData.category,
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

/* Controller - Delete Product */
Controller.delete = (request, response, next) => {
    const id = request.params.productID;

    Category.findOne({
            _id: id
        })
        .exec()
        .then((result) => {
            return new Promise((resolve, reject) => {
                if (result) {
                    resolve(result);
                } else {
                    reject({
                        message: 'Product does not exists'
                    });
                }
            });
        })
        .then((result) => {
            Product.remove({ _id: id })
                .exec()
                .then(result => {
                    response.status(200)
                        .json({
                            message: 'Product Deleted Successfully'
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