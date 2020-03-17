const express = require('express');
const router = express.Router();
const Company = require('../../models/Company');

// Get all companies
router.get('/', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('admin')) {
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
            name: new RegExp(req.query.name, 'i')
        };

        // Find all companies
        const companies = await Company.paginate(regexQuery, options);

        // If none is found return 404, if companies are found return array
        if (companies.docs.length === 0) {
            res.status(404).json({
                message: 'No companies found.',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/companies'
                }
            })
        } else {
            res.status(200).json({
                info: {
                    message: 'Paginated results',
                    resource: 'Companies',
                    query: {
                        page: 'page',
                        limit: 'perPage',
                        disable: 'paginate=false'
                    }
                },
                companies
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Get company by ID
router.get('/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('user')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Find company by ID
        const company = await Company.findOne({_id: req.params.id})
            .select('-__v')
            .populate('projects');

        // Response
        res.status(200).json({
            company
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Create company
router.post('/', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('admin')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Find existing company
        const existingCompany = await Company.findOne({name: req.body.name});

        // Check if company with name exists
        if (existingCompany) {
            res.status(500).json({
                error: 'Company with given name already exists.'
            })
        }

        // Check if name not given
        if (!req.body.name) {
            res.status(400).json({
                message: 'Invalid request',
                error: 'Company name not given.'
            });
            return
        }

        // Construct company object
        const company = new Company({
            name: req.body.name,
            businessId: req.body.businessId,
            industry: req.body.industry,
            address: req.body.address,
            contacts: req.body.contacts
        });

        // Save to database
        const result = await company.save();

        // Response
        res.status(200).json({
            message: 'New company created.',
            result
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error',
            error: e
        })
    }
});

// Update company
router.put('/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('admin')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // Find and update provided values
        const oldCompany = await Company.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            useFindAndModify: false
        });

        res.status(200).json({
            message: 'Company updated.',
            oldCompany
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

// Delete company
router.delete('/:id', async (req, res) => {
    if (!req.authenticated || !req.roles.includes('admin')) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return
    }
    try {
        // TODO: Cast to ObjectId error response
        const existingCompany = await Company.findById(req.params.id);

        if (!existingCompany) {
            res.status(404).json({
                message: 'Request failed.',
                error: 'Company not found.'
            });
            return
        }

        const deletedCompany = await Company.deleteOne({_id: req.params.id});

        res.status(200).json({
            message: 'Company deleted.',
            deletedCompany: existingCompany,
            status: deletedCompany
        })
    } catch (e) {
        res.status(500).json({
            message: 'Unexpected error.',
            error: e
        })
    }
});

module.exports = router;