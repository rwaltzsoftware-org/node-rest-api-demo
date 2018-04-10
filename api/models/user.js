const mongoose = require('mongoose');

const schema = mongoose.Schema({

    'name': { type: String, required: true},
    'email': { type: String, required:true, unique: true },
    'password': { type: String, required: true },
    'profileImage': { type: String, default: 'default.jpg' },
    'roles': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' } ],
    'resetcode':{type: String , default: null },
    'resetvalidtill':{type: Date, default: null}
});

module.exports = mongoose.model('User',schema);
