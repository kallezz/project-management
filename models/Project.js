const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
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
        ref: 'Company'
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