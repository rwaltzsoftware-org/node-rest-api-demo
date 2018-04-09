const mongoose = require('mongoose');

const schema = mongoose.Schema({

    'name': { type: String, required: true},
    'email': { type: String, required:true, unique: true },
    'password': { type: String, required: true },
    'profileImage': { type: String, default: 'default.jpg' },
    'roles': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' } ]
});

module.exports = mongoose.model('User',schema);