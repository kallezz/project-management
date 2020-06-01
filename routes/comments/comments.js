const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Project = require('../../models/Project');
const User = require('../../models/User');

// Get all comments
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
            body: new RegExp(req.query.body, 'i')
        };

        // Find all comments
        const comments = await Comment.paginate(regexQuery, options);

        // If none is found return 404, if companies are found return array
        if (comments.docs.length === 0) {
            res.status(404).json({
                message: 'No comments found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/comments'
                }
            })
        } else {
            res.status(200).json({
                info: {
                    message: 'Paginated results',
                    resource: 'Comments',
                    query: {
                        page: 'page',
                        limit: 'perPage',
                        disable: 'paginate=false'
                    }
                },
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

// Get comments by project ID
router.get('/project/:id', async (req, res) => {
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
            pagination: paginateBool,
            sort: '-createdAt',
            populate: {
                path: 'author',
                select: 'username _id'
            }
        };

        // Filters
        const regexQuery = {
            project: req.params.id,
            body: new RegExp(req.query.body, 'i')
        };

        // Find all comments
        const comments = await Comment.paginate(regexQuery, options);

        // If none is found return 404, if companies are found return array
        if (comments.docs.length === 0) {
            res.status(404).json({
                message: 'No comments found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/comments'
                }
            })
        } else {
            res.status(200).json({
                info: {
                    message: 'Paginated results',
                    resource: 'Comments',
                    query: {
                        page: 'page',
                        limit: 'perPage',
                        disable: 'paginate=false'
                    }
                },
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

// Get comments by document ID
router.get('/document/:id', async (req, res) => {
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
            document: req.params.id,
            body: new RegExp(req.query.body, 'i')
        };

        // Find all comments
        const comments = await Comment.paginate(regexQuery, options);

        // If none is found return 404, if companies are found return array
        if (comments.docs.length === 0) {
            res.status(404).json({
                message: 'No comments found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/comments'
                }
            })
        } else {
            res.status(200).json({
                info: {
                    message: 'Paginated results',
                    resource: 'Comments',
                    query: {
                        page: 'page',
                        limit: 'perPage',
                        disable: 'paginate=false'
                    }
                },
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
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
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
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Check if values not given
        if (!req.body.body) {
            res.status(400).json({
                message: 'Invalid request',
                error: 'Required values missing.'
            });
            return
        }

        // Construct comment object
        const comment = new Comment({
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

        // Get author
        const commentAuthor = await User.findOne({_id: req.body.author});

        // Response
        res.status(200).json({
            message: 'New comment created.',
            result: {
                ...result._doc,
                author: {
                    _id: commentAuthor._id,
                    username: commentAuthor.username
                }
            },
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
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
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
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
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