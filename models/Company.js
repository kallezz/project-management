const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    businessId: {
        type: String
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
            name: String,
            email: String,
            phone: String
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

companySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Company', companySchema);