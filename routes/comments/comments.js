const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Project = require('../../models/Project');

// Get all comments
router.get('/', async (req, res) => {
    try {
        // Find all comments
        const comments = await Comment.find().select('-__v');

        // If none is found return 404, if companies are found return array
        if (comments.length === 0) {
            res.status(404).json({
                message: 'No comments found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/comments'
                }
            })
        } else {
            res.status(200).json({
                info: 'List of all comments',
                comments
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Get comment by ID
router.get('/:id', async (req, res) => {
    try {
        // Find comment by ID
        const comment = await Comment.findOne({_id: req.params.id})
            .select('-__v')
            .populate('author project document', '-password -__v');

        // Response
        res.status(200).json({
            comment
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Create comment
router.post('/', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Check if values not given
        if (!req.body.title || !req.body.body) {
            res.status(400).json({
                message: 'Invalid request',
                error: 'Required values missing.'
            });
            return
        }

        // Construct comment object
        const comment = new Comment({
            title: req.body.title,
            body: req.body.body,
            author: req.body.author,
            project: req.body.project,
            document: req.body.document,
            isGlobal: req.body.isGlobal
        });

        // Save to database
        const result = await comment.save();

        // Update project
        const updatedProject = await Project.updateOne({
            _id: req.body.project
        }, {
            $push: {
                comments: result._id
            }
        });

        // Response
        res.status(200).json({
            message: 'New comment created.',
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

// Update comment
router.put('/:id', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find and update provided values
        const oldComment = await Comment.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            useFindAndModify: false
        });

        res.status(200).json({
            message: 'Comment updated.',
            oldComment
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

// Delete comment
router.delete('/:id', async (req, res) => {
    try {
        // TODO: Cast to ObjectId error response
        const existingComment = await Comment.findById(req.params.id);

        if (!existingComment) {
            res.status(404).json({
                message: 'Request failed.',
                error: 'Comment not found.'
            });
            return
        }

        const deletedComment = await Comment.deleteOne({_id: req.params.id});

        // Update project
        const updatedProject = await Project.updateOne({
            _id: existingComment.project
        }, {
            $pull: {
                comments: req.params.id
            }
        });

        res.status(200).json({
            message: 'Comment deleted.',
            deletedComment: existingComment,
            status: deletedComment,
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