const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../../config');

const categoryFolder = './' + config.filePaths.category;
const categoryController = require('../controllers/category');

let categoryImage = String;


/* Upload File Preprations */
const storage = multer.diskStorage({
    destination: categoryFolder,
    filename: (request, file, callBack) => {
        callBack(null, new Date().toISOString() + file.originalname);
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
router.post('/', upload.single('image'), categoryController.store);

/* Route - Get Specific Data using Id */
router.get('/:categoryID', categoryController.get);

/* Route - Update Category */
router.put('/:categoryID', upload.single('image'), categoryController.update);

/* Route - Getting All Categories */
router.get('/', categoryController.getAll);

/* Route - Delete Catgory */
router.delete('/:categoryID', categoryController.delete);

module.exports = router;