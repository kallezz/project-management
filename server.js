const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticated = require('./middleware/authenticated');
const cors = require('cors');

// Define app and port
const app = express();
const port = process.env.PORT || 5000;

// CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Authentication middleware
app.use(authenticated);

app.get('/', (req, res, next) => {
    res.status(404).json({
        message: 'This API does not contain root route.'
    })
});

// Use routes
const routes = require('./routes/routes');
app.use(routes);

// Connect database
mongoose.connect('mongodb://localhost/projectmanager', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log('\x1b[32m%s\x1b[0m','MongoDB succesfully connected.'))
    .catch(e => console.error(e.message));

// Start server
app.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m',`Server listening. (Port: ${port})`)
});