const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');

// Get all projects
router.get('/', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('user')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find all projects
        const projects = await Project.find().select('-__v');

        // If none is found return 404, if companies are found return array
        if (projects.length === 0) {
            res.status(404).json({
                message: 'No projects found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/comments'
                }
            })
        } else {
            res.status(200).json({
                info: 'List of all projects',
                projects
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Get project by ID
router.get('/:id', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('user')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find project by ID
        const project = await Project.findOne({_id: req.params.id})
            .select('-__v')
            .populate('users company documents manager comments', '-password -__v');

        // Response
        res.status(200).json({
            project
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// TODO: Get all projects by company ID

// Create project
router.post('/', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find existing project
        const existingProject = await Project.findOne({title: req.body.title});

        // Check if project with title exists
        if (existingProject) {
            res.status(500).json({
                error: 'Project with given title already exists.'
            })
        }

        // Check if title not given
        if (!req.body.title) {
            res.status(400).json({
                message: 'Invalid request',
                error: 'Project title not given.'
            });
            return
        }

        // Construct project object
        const project = new Project({
            title: req.body.title,
            description: req.body.description,
            deadline: req.body.deadline,
            manager: req.body.manager,
            projectType: req.body.projectType,
            projectId: req.body.projectId,
            published: req.body.published,
            company: req.body.company,
            users: req.body.users
        });

        // Save to database
        const result = await project.save();

        // Response
        res.status(200).json({
            message: 'New project created.',
            result
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Update project
router.put('/:id', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find and update provided values
        const oldProject = await Project.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            useFindAndModify: false
        });

        res.status(200).json({
            message: 'Project updated.',
            oldProject
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // TODO: Cast to ObjectId error response
        const existingProject = await Project.findById(req.params.id);

        if (!existingProject) {
            res.status(404).json({
                message: 'Request failed.',
                error: 'Project not found.'
            });
            return
        }

        const deletedProject = await Project.deleteOne({_id: req.params.id});

        res.status(200).json({
            message: 'Project deleted.',
            deletedCompany: existingProject,
            status: deletedProject
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

module.exports = router;