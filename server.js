const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticated = require('./middleware/authenticated');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(authenticated);

app.get('/', (req, res, next) => {
    res.send('Hello world!')
});

const userRoutes = require('./routes/users/users');
app.use('/users', userRoutes);

const companyRoutes = require('./routes/companies/companies');
app.use('/companies', companyRoutes);

const projectRoutes = require('./routes/projects/projects');
app.use('/projects', projectRoutes);

const commentRoutes = require('./routes/comments/comments');
app.use('/comments', commentRoutes);

mongoose.connect('mongodb://localhost/projectmanager', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log('\x1b[32m%s\x1b[0m','MongoDB succesfully connected.'))
    .catch(e => console.error(e.message));

app.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m',`Server listening. (Port: ${port})`)
});