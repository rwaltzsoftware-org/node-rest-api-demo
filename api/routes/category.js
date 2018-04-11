const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../../config');
const checkAuth = require('../middlewares/check-auth');

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
router.post('/',  upload.single('image'),checkAuth, categoryController.store);

/* Route - Get Specific Data using Id */
router.get('/:categoryID',checkAuth, categoryController.get);

/* Route - Update Category */
router.put('/:categoryID',checkAuth, upload.single('image'), categoryController.update);

/* Route - Getting All Categories */
router.get('/',checkAuth, categoryController.getAll);

/* Route - Delete Catgory */
router.delete('/:categoryID',checkAuth, categoryController.delete);

module.exports = router;