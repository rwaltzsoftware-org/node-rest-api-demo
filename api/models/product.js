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
    },
    'category': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }]
}

let schemaOption = {
    timestamp: true
}

const schema = mongoose.Schema(schemaField, schemaOption);

module.exports = mongoose.model('Product', schema);