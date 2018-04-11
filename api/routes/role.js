const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role');

/*  Listing  */
router.get('/', roleController.listing);

/*  Details  */
router.get('/:roleId', roleController.getDetails);

/*  Create  */
router.post('/', roleController.store);

/*  Edit  */
router.put('/:roleId', roleController.update);

/*  Delete  */
router.delete('/:roleId', roleController.delete);

module.exports = router;