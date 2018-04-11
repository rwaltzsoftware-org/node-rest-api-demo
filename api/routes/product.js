const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/product');
const config = require('../../config');
const checkAuth = require('../middlewares/check-auth');

const productFolder = './' + config.filePaths.product;

/* Upload File Preprations */
const storage = multer.diskStorage({
    destination: productFolder,
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


/* Route - Product Add */
router.post('/', upload.single('image'),checkAuth, productController.store);

/* Route - Get Specific Data using Id */
router.get('/:productID',checkAuth, productController.get);

/* Route - Update Product */
router.put('/:productID', upload.single('image'),checkAuth, productController.update);

/* Route - Getting All Produts */
router.get('/',checkAuth, productController.getAll);

/* Route - Delete Product */
router.delete('/:productID',checkAuth, productController.delete);

module.exports = router;