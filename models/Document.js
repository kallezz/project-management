const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const documentSchema = new mongoose.Schema({
    description: String,
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    file: {
        fileName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            required: true
        }
    },
    accepted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

documentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Document', documentSchema);