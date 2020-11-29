const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db.config');
const { query } = require('./db.config');
const bcrypt = require('bcrypt');
const saltRounds = 7;

const router = express.Router();

const Pet = require('./api-request');

// Homepage Route
router.get('/', (req, res) => {  
    res.render('index', {
        title: 'Homepage'
    });
});

// About Page Route
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us'
    });
});

// Event Page Route
router.get('/event', (req, res) => {
    db.query('SELECT * FROM event WHERE event_date >= CURDATE() ORDER BY event_date ASC', (err, results) => {
        if (err)
            console.log(err);
        res.render('event', 
        {
            events: results,
            date: date,
            title: 'Events'
        });
    })
});

// Adopt Page Route
router.get('/adopt', (req, res) => {
    res.render('adopt', {
        title: 'Adoptions'
    });
});

// Volunteer Page Route
router.get('/volunteer', (req, res) => {
    res.render('volunteer', {
        title: 'Volunteer'
    });
});

// Donate Page Route
router.get('/donate', (req, res) => {
    res.render('donate', {
        title: 'Donate'
    });
});

// Blog Page Route
router.get('/blog', (req, res) => {
    db.query('SELECT * FROM blog ORDER BY created_at DESC', (err, results) => {
        if (err)
            console.log(err);
        res.render('blog', {
            posts: results,
            title: 'Blog'
        });
    })      
});

// Sign In Check Route => from Nav Button
router.post('/checkSignin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password) {
        db.query('SELECT password FROM user WHERE email = ?',
        email, 
        (err, results) => {
            if (err)
                console.log(err);
            console.log(results[0].password);
            bcrypt.compare(password, results[0].password, (err, result) => { 
                if (err)
                    console.log(err);
                else if (result == true) {
                    req.session.loggedin = true;
                    req.session.email = email;
                    console.log("You successfully logged in " + email);
                } else
                    console.log('Incorrect Email and/or Password!');
            });
        });
        res.render('index', {
            title: 'Homepage'  
          });
    } else {
        console.log("Error " + email + ", " + password);
        res.render('register', {
            title: 'Register',
            message: 'Please register for an account.'
        });
    }
});

// Registration Page Route
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

// Registration Route => from Register Page button
router.post('/submitRegister', (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const zipCode = req.body.zipCode;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err)
            console.log(err);
        bcrypt.hash(password, salt, (err, hash) => {
            if (err)
                console.log(err);
            db.query("INSERT INTO user_information (email,address,city,state,zip_code,phone_number) VALUES ('" + email + "','" + address + "','" + city + "','" + state + "'," + zipCode + ",'" + phoneNumber + "')",
            (err, results) => {
                if (err)
                    console.log(err);
                console.log(results + " was posted to user_information!")
                db.query("INSERT INTO user (email,password,first_name,last_name) VALUES ((SELECT email FROM user_information WHERE email = '" + email + "'),'" + hash + "','" + firstName + "','" + lastName + "')",
                (err, results) => {
                    if (err)
                        console.log(err);
                    console.log(results + " was posted to user!")
                    res.render('index', {
                        title: 'Homepage'
                    });
                });
            });
        });
    });
});

    

// Create Event Page Route => includes RBAC controls
router.get('/createEvent', (req, res) => {


    db.query('SELECT role FROM user WHERE email = ?', 
    [req.session.email], 
    (err, results) => {
        if (err)
            console.log(err);
        else if (results.equals('contributor' || 'admin')) {
            res.send('Welcome back, ' + req.session.email + '!');
            res.render('createEvent', {
                title: 'Create an Event'
            });
	    } else {
            res.status(403).end();
        }
    });
});

// Route to Submit an Event => from Create Event button
router.post('/submitEvent', (req, res) => {
    // this is a test to see if it will fill the entire tuple or just one
    const eventDetails = req.body;
    db.query('INSERT INTO event SET ?', 
    eventDetails,
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was posted!")
    });
    res.redirect('/event', {
        title: 'Events'
    });
});

// Create Post Page Route => includes RBAC controls
router.get('/createPost', (req, res) => {
    db.query('SELECT role FROM user WHERE email = ?', 
    [req.session.email], 
    (err, results) => {
        if (err)
            console.log(err);
        else if (results.equals('contributor' || 'admin')) {
            res.send('Welcome back, ' + req.session.email + '!');
            res.render('createPost', {
                title: 'Create a Post'
            });
	    } else {
            res.status(403).end();
        }
    });
});

// Route to Submit an Post => from Create Post button
router.post('/submitPost', (req, res) => {
    const eventDetails = req.body;
    db.query('INSERT INTO event SET ?', 
    eventDetails,
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was posted!")
    });
    res.redirect('/blog', {
        title: 'Blog'
    });
});

// Create Category Page Route => includes RBAC controls
router.get('/createCategory', (req, res) => {
    db.query('SELECT role FROM user WHERE email = ?', 
    [req.session.email], 
    (err, results) => {
        if (err)
            console.log(err);
        else if (results.equals('contributor' || 'admin')) {
            res.send('Welcome back, ' + req.session.email + '!');
            res.render('createCategory', {
                title: 'Create a Category'
            });
	    } else {
            res.status(403).end();
        }
    });
});

// Route to Submit an Category => from Create Category button
router.post('/submitCategory', (req, res) => {
    const name = req.params.name;
    const slug = req.params.slug;
    const description = req.params.description;
    db.query('INSERT INTO category (name, slug, description) VALUES ('+ name + ',' + slug + ',' + description + ')',
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was added to category!");
    });
    res.redirect('/createCategory', {
        title: 'Create a Category'
    });
});

// Create Tag Page Route => includes RBAC controls
router.get('/createTag', (req, res) => {
    db.query('SELECT role FROM user WHERE email = ?', 
    [req.session.email], 
    (err, results) => {
        if (err)
            console.log(err);
        else if (results.equals('contributor' || 'admin')) {
            res.send('Welcome back, ' + req.session.email + '!');
            res.render('createTag', {
                title: 'Create a Tag'
            });
	    } else {
            res.status(403).end();
        }
    });
});

// Route to Submit a Tag => from Create Tag button
router.post('/submitTag', (req, res) => {
    const name = req.params.name;
    const slug = req.params.slug;
    const description = req.params.description;
    db.query('INSERT INTO tag (name, slug, description) VALUES ('+ name + ',' + slug + ',' + description + ')',
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was added to tag!");
    });
    res.redirect('/createTag', {
        title: 'Create a Tag'
    });
});

module.exports = router;