const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Category = require('../models/category');
const config = require('../../config');

const categoryFolder = config.filePaths.category;
const moduleName = config.routeSlug.category;
let categoryImage = String;

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

/* Upload File Preprations */
const storage = multer.diskStorage({
    destination: categoryFolder,
    filename: (request, file, callBack) => {
        categoryImage = new Date().toISOString() + file.originalname;
        callBack(null, categoryImage);
    }
})

const fileType = (request, file, callBack) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callBack(null, true);
    } else {
        callBack(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileType
});


/* Route - Category Add */
router.post('/', upload.single('image'), (request, response, next) => {

    /* Check Category Name Duplication */
    Category.findOne({
            name: request.body.name
        })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result) {
                    /* Removed category image if duplication found */
                    fs.unlink(categoryFolder + categoryImage);
                    reject({ message: 'Category with this name already present'});
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

});

/* Route - Get Specific Data using Id */
router.get('/:categoryId', (request, response, next) => {
    const id = request.params.categoryId;

    Category.findById({
            _id: id
        })
        .exec()
        .then(result => {
            return new Promise((resolve, reject) => {
                if (result === null) {
                    reject({ message: 'Can not found any category with this ID'});
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
            if (err.name === 'CastError'){
                err = {
                    message: 'Inccorect Category ID, Please check'
                }
            }
            
            response.status(500)
                .json({
                    error: err
                })
        });
});


/* Route - Getting All Categories */
router.get('/', (request, response, next) => {
    Category.find()
        .exec()
        .then(result => {
            response.status(200)
                .json({
                    responseData: result
                });
        })
        .catch(error => {
            response.status(500)
                .json({
                    Error: error
                });
        });
});


module.exports = router;