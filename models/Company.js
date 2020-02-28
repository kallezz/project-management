const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    businessId: {
        type: String,
        unique: true
    },
    industry: String,
    address: [
        {
            addressName: String,
            street: String,
            zip: String,
            city: String
        }
    ],
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);