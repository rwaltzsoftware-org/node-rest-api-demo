const express = require('express');
const router = express.Router();


/*  Listing  */
router.get('/', (request, response ) => 
{
    console.log("Roles Listing Called");
    response.end("Roles Create Called");
});

/*  Create  */
router.post('/', (request, response) => {
    console.log("Roles Create Called");
    response.end("Roles Create Called");
});

/*  Edit  */
router.put('/:roleId', (request, response) => {
    console.log("Roles Edit Called");
    response.end();
}); 

/*  Delete  */
router.delete('/:roleId', (request, response) => {
    console.log("Roles Delete Called");
    response.end();
});

module.exports = router;