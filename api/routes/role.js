const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role');
const checkAuth = require('../middlewares/check-auth');

/*  Listing  */
router.get('/',checkAuth, roleController.listing);

/*  Details  */
router.get('/:roleId',checkAuth, roleController.getDetails);

/*  Create  */
router.post('/',checkAuth, roleController.store);

/*  Edit  */
router.put('/:roleId',checkAuth, roleController.update);

/*  Delete  */
router.delete('/:roleId',checkAuth, roleController.delete);

module.exports = router;