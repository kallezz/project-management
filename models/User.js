const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);