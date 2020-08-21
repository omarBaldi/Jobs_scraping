const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mainRoute = require('./routes/main');


//Initialize app
const app = express();

//Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '/views'));
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Routes
app.use('/', mainRoute);

//Start server
const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server running on localhost://${port}`));