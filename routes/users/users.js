const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password -__v');
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

// Register user
router.post('/', async (req, res) => {
    try {
        const existingUser = await User.findOne({email: req.body.username});

        if (existingUser) {
            res.status(500).json({
                error: 'User already exists.'
            })
        }

        const hash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            phone: req.body.phone,
            roles: req.body.roles
        });

        const result = await user.save();

        res.status(200).json(result)
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

        // If user doesn't exist
        if (!user) {
            res.status(401).json({
                message: 'Authorization failed.',
                error: 'Username or password is incorrect.'
            });
            return
        }

        // Compare password
        const isEqual = await bcrypt.compare(req.body.password, user.password);

        // If password was incorrect
        if (!isEqual) {
            res.status(401).json({
                message: 'Authorization failed.',
                error: 'Username or password is incorrect.'
            });
            return
        }

        // TODO: Secure secret for JWT
        // Sign a token
        const token = jwt.sign({userId: user._id, username: user.username}, 'somesecretforlocal', {
            expiresIn: '24h'
        });

        // Return a token in response
        res.status(200).json({
            userId: user._id,
            username: user.username,
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
router.post('/:id', async (req, res) => {
    try {
        // Find user by ID
        const user = await User.findOne({_id: req.params.id});

        // If new password
        if (req.body.password) {
            if (!req.body.oldPassword) {
                res.status(401).json({
                    message: 'Authorization failed.',
                    error: 'Old password not provided.'
                });
                return
            }

            const isEqual = await bcrypt.compare(req.body.oldPassword, user.password);

            if (!isEqual) {
                res.status(401).json({
                    message: 'Authorization failed.',
                    error: 'Old password does not match.'
                });
                return
            }

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

module.exports = router;