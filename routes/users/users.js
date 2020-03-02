const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Get all users
router.get('/', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('user')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find all users
        const users = await User.find().select('-password -__v');

        // If users not found return 404, if users are found return array
        if (users.length === 0) {
            res.status(404).json({
                message: 'No users found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/users'
                }
            })
        } else {
            res.status(200).json({
                info: 'List of all users',
                users
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Find user by ID
router.get('/:id', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('user')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find company by ID
        const user = await User.findOne({_id: req.params.id})
            .select('-__v')
            .populate('company');

        // Response
        res.status(200).json({
            user
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// TODO: Get all users by company ID

// Register user
router.post('/', async (req, res) => {
    // if (!req.authenticated || !req.roles.includes('admin')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find existing user
        const existingUser = await User.findOne({email: req.body.username});

        // Check if user exists with given username
        if (existingUser) {
            res.status(500).json({
                message: 'Request failed.',
                error: 'User already exists.'
            })
        }

        // Hash password
        const hash = await bcrypt.hash(req.body.password, 10);

        // Construct user object
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            phone: req.body.phone,
            roles: req.body.roles
        });

        // Save to database
        const result = await user.save();

        // Response
        res.status(200).json({
            message: 'New user created.',
            result
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.body.username });

        // Check if user doesn't exist
        if (!user) {
            res.status(401).json({
                message: 'Authorization failed.',
                error: 'Username or password is incorrect.'
            });
            return
        }

        // Compare password
        const isEqual = await bcrypt.compare(req.body.password, user.password);

        // Check if password was incorrect
        if (!isEqual) {
            res.status(401).json({
                message: 'Authorization failed.',
                error: 'Username or password is incorrect.'
            });
            return
        }

        // TODO: Secure secret for JWT
        // Sign a token
        const token = jwt.sign({userId: user._id, username: user.username, roles: user.roles}, 'somesecretforlocal', {
            expiresIn: '24h'
        });

        // Return a token in response
        res.status(200).json({
            userId: user._id,
            username: user.username,
            roles: user.roles,
            token
        })
    } catch (e) {
        res.status(401).json({
            message: 'Unexpected error.',
            error: e
        });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    // if (!req.authenticated || req.userId === req.params.id || !req.roles.includes('user')) {
    //     res.status(401).json({
    //         message: 'Unauthorized.'
    //     });
    //     return
    // }
    try {
        // Find user by ID
        const user = await User.findOne({_id: req.params.id});

        // If new password
        if (req.body.password) {
            // Check if old password was given
            if (!req.body.oldPassword) {
                res.status(401).json({
                    message: 'Authorization failed.',
                    error: 'Old password not provided.'
                });
                return
            }

            // Compare old password
            const isEqual = await bcrypt.compare(req.body.oldPassword, user.password);

            // Check if old password was incorrect
            if (!isEqual) {
                res.status(401).json({
                    message: 'Authorization failed.',
                    error: 'Old password does not match.'
                });
                return
            }

            // Hash new password
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        // Find and update provided values
        const oldUser = await User.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            useFindAndModify: false
        });

        // Response
        res.status(200).json({
            message: 'User updated.',
            oldUser: {
                ...oldUser._doc,
                password: null
            }
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        // TODO: Cast to ObjectId error response
        const existingUser = await User.findById(req.params.id);

        if (!existingUser) {
            res.status(404).json({
                message: 'Request failed.',
                error: 'User not found.'
            });
            return
        }

        const deletedUser = await User.deleteOne({_id: req.params.id});

        res.status(200).json({
            message: 'User deleted.',
            deletedUser: existingUser,
            status: deletedUser
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

module.exports = router;