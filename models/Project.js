const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    deadline: Date,
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectType: String,
    projectId: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    documents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        }
    ],
    published: {
        type: Boolean,
        required: true,
        default: false
    },
    finished: {
        type: Boolean,
        required: true,
        default: false
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

projectSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Project', projectSchema);