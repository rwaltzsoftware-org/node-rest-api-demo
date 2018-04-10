const mongoose = require('mongoose');

let schemaField = {
    'name': {
        type: String,
        required: true
    },
    'image': {
        type: String,
        required: true
    },
    'description': {
        type: String,
        required: true
    }
}

let schemaOption = {
    timestamp: true
}

const schema = mongoose.Schema(schemaField, schemaOption);

module.exports = mongoose.model('Category', schema);