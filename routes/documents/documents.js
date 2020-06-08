const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const Document = require('../../models/Document');
const Project = require('../../models/Project');

const acceptedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/gif',
    'application/pdf',
    'application/zip'
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (acceptedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 8
    },
    fileFilter
});

// Get all documents
router.get('/', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Pagination options
        const { page, perPage, paginate } = req.query;
        const paginateBool = paginate ? (paginate === 'true') : true;

        const options = {
            page: parseInt(page) ||1,
            limit: parseInt(perPage) || 10,
            select: '-__v',
            pagination: paginateBool
        };

        // Filters
        const regexQuery = {
            description: new RegExp(req.query.description, 'i')
        };

        // Find all documents
        const documents = await Document.paginate(regexQuery, options);

        // If none is found return 404, if companies are found return array
        if (documents.length === 0) {
            res.status(404).json({
                message: 'No documents found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/documents'
                }
            })
        } else {
            res.status(200).json({
                info: {
                    message: 'Paginated results',
                    resource: 'Documents',
                    query: {
                        page: 'page',
                        limit: 'perPage',
                        disable: 'paginate=false'
                    }
                },
                documents
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Get documents by project ID
router.get('/project/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Find all documents
        const documents = await Document.find({
            project: req.params.id
        }).select('-__v -file');

        // If none is found return 404, if companies are found return array
        if (documents.length === 0) {
            res.status(404).json({
                message: 'No documents found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/documents'
                }
            })
        } else {
            res.status(200).json({
                info: 'List of all documents in this project',
                documents
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Get document by ID
router.get('/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Find document by ID
        const document = await Document.findOne({_id: req.params.id})
            .select('-__v');

        // Response
        res.status(200).json({
            document
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Get doc by ID

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

router.get ('/file/:id', cors(corsOptions), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new Error(`File with an id of ${req.params.id} cannot be found.`);
        }
        const doc = await Document.findOne({_id: req.params.id});
        res.contentType(doc.file.fileType.toString());
        res.send(doc.file.fileBuffer);
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e.message
        })
    }
});

// Create document
router.post('/', upload.single('document'), async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Check if values not given
        // if (!req.body.document || !req.body.project) {
        //     res.status(400).json({
        //         message: 'Invalid request',
        //         error: 'Required values missing.'
        //     });
        //     return
        // }

        const doc = fs.readFileSync(req.file.path);
        const encode_doc = doc.toString('base64');

        // Construct document object
        const document = new Document({
            description: req.body.description,
            project: req.body.project,
            file: {
                fileBuffer: new Buffer(encode_doc, 'base64'),
                fileType: req.file.mimetype
            },
            accepted: req.body.accepted
        });

        // Save to database
        const result = await document.save();

        // Update project
        const updatedProject = await Project.updateOne({
            _id: req.body.project
        }, {
            $push: {
                documents: result._id
            }
        });

        // Response
        res.status(200).json({
            message: 'New document created.',
            result,
            updatedProject
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Update document
router.put('/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('admin')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Find and update provided values
        const oldDocument = await Document.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            useFindAndModify: false
        });

        res.status(200).json({
            message: 'Document updated.',
            oldDocument
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

// Delete document
router.delete('/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('admin')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // TODO: Cast to ObjectId error response
        const existingDocument = await Document.findById(req.params.id);

        if (!existingDocument) {
            res.status(404).json({
                message: 'Request failed.',
                error: 'Document not found.'
            });
            return
        }

        const deletedDocument = await Document.deleteOne({_id: req.params.id});

        // Update project
        const updatedProject = await Project.updateOne({
            _id: existingDocument.project
        }, {
            $pull: {
                documents: req.params.id
            }
        });

        res.status(200).json({
            message: 'Document deleted.',
            deletedDocument: existingDocument,
            status: deletedDocument,
            updatedProject
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

module.exports = router;