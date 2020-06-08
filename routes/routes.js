const express = require('express');
const app = express();

// User routes
const userRoutes = require('./users/users');
app.use('/users', userRoutes);

// Company routes
const companyRoutes = require('./companies/companies');
app.use('/companies', companyRoutes);

// Project routes
const projectRoutes = require('./projects/projects');
app.use('/projects', projectRoutes);

// Comment routes
const commentRoutes = require('./comments/comments');
app.use('/comments', commentRoutes);

// Document routes
const documentRoutes = require('./documents/documents');
app.use('/documents', documentRoutes);

// Mail routes
const mailRoutes = require('./email/email');
app.use('/mail', mailRoutes);

module.exports = app;