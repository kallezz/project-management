const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
            type: String,
            required: true,
            unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }
    ],
    roles: [
        {
            type: String
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);