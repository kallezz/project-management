const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello world!')
});

const userRoutes = require('./routes/users/users');
app.use('/users', userRoutes);

const companyRoutes = require('./routes/companies/companies');
app.use('/companies', companyRoutes);

mongoose.connect('mongodb://localhost/projectmanager', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log('MongoDB succesfully connected.'))
    .catch(e => console.error(e.message));

app.listen(port, () => {
    console.log('Server listening.')
});