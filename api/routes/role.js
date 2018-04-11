const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role');

/*  Listing  */
router.get('/', roleController.listing);

/*  Details  */
router.get('/:roleId', roleController.details);

/*  Create  */
router.post('/', roleController.create);

/*  Edit  */
router.put('/:roleId', roleController.update);

/*  Delete  */
router.delete('/:roleId', roleController.delete);

module.exports = router;