const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const pagesRouter = require('./controllers/routes');

const app = express();

app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/', pagesRouter);


require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const port = process.env.PORT || 5000;

app.listen(port, () => { 
    console.log(`Server running on port ${port} 🔥`);
});