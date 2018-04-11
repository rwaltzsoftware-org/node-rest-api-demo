const express = require('express');
const router = express.Router();
const multer = require('multer');
const appConfig = require('../../config');
const userController = require('../controllers/user');

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


/*  Listing  */
router.get('/', userController.listing);

/*  Details  */
router.get('/:userId', userController.getDetails );

/*  Create  */
router.post('/', upload.single('profileImage'), userController.store );

/*  Edit  */
router.put('/:userId', upload.single('profileImage'), userController.update);

/*  Delete  */
router.delete('/:userId', userController.delete);

module.exports = router;