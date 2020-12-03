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
var sess;

// Homepage Route
router.get('/', (req, res) => {  
    res.render('index', {
        sess: sess,
        title: 'Homepage'
    });
});

// About Page Route
router.get('/about', (req, res) => {
    res.render('about', {
        sess: sess,
        title: 'About Us'
    });
});

// Event Page Route
router.get('/event', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    db.query('SELECT u.first_name, u.last_name, e.title, e.image, e.event_date, e.event_time, e.content, e.created_at, c.category_title, t.tag_title FROM event e INNER JOIN category c on c.category_id = e.category_id INNER JOIN tag t on t.tag_id = e.tag_id INNER JOIN user u on u.user_id = e.user_id ORDER BY e.created_at DESC', 
    (err, results) => {
        if (err)
            console.log(err);
        res.render('event', 
        {
            sess: sess,
            events: results,
            date: date,
            title: 'Events'
        });
    })
});

// Adopt Page Route
router.get('/adopt', (req, res) => {
    res.render('adopt', {
        sess: sess,
        title: 'Adoptions'
    });
});

// Volunteer Page Route
router.get('/volunteer', (req, res) => {
    res.render('volunteer', {
        sess: sess,
        title: 'Volunteer'
    });
});

// Donate Page Route
router.get('/donate', (req, res) => {
    res.render('donate', {
        sess: sess,
        title: 'Donate'
    });
});

// Blog Page Route
router.get('/blog', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
    (err, results) => {
        console.log(results);
        if (err)
            console.log(err);
        res.render('blog', {
            sess: sess,
            posts: results,
            date: date,
            title: 'Blog'
        });
    })      
});

// Contact Page Route
router.get('/contact', (req, res) => {
    res.render('contact', {
        sess: sess,
        title: 'Contact Us'
    });
});

router.get('/volunteerForm', (req, res) => {
    res.render('volunteerForm', {
        sess: sess,
        title: 'Volunteer Form'
    });
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
                    sess = req.session;
                    sess.email = email;
                    console.log("You successfully logged in " + email);
                    console.log(sess);
                } else
                    console.log('Incorrect Email and/or Password!');
            });
        });
        res.render('index', {
            sess: sess,
            title: 'Homepage'  
          });
    } else {
        console.log("Error " + email + ", " + password);
        res.render('register', {
            sess: sess,
            title: 'Register',
            message: 'Please register for an account.'
        });
    }
});

// Registration Page Route
router.get('/register', (req, res) => {
    res.render('register', {
        sess: sess,
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
                db.query("INSERT INTO user (email,password,first_name,last_name) VALUES ('" + email + "','" + hash + "','" + firstName + "','" + lastName + "')",
                (err, results) => {
                    if (err)
                        console.log(err);
                    console.log(results + " was posted to user!")
                    res.render('index', {
                        sess: sess,
                        title: 'Homepage'
                    });
                });
            });
        });
    });
});

// Create Event Page Route => includes RBAC controls
router.get('/createEvent', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    if (sess != null) {
        db.query('SELECT role FROM user WHERE email = ?', 
        [sess.email], 
        (err, results) => {
            var temp = results[0].role;
            if (err)
                console.log(err);
            else if (temp == 'Contributor' || temp == 'Admin') {
                db.query("SELECT category_title FROM category",
                (err, categories) => {
                    if (err)
                        console.log(err);
                    db.query("SELECT tag_title FROM tag", 
                    (err, tags) => {
                        if (err)
                            console.log(err);
                        res.render('createEvent', {
                            sess: sess,
                            categories: categories,
                            tags: tags,
                            title: 'Create an Event'
                        });
                    });
                });
            } else {
                db.query('SELECT u.first_name, u.last_name, e.title, e.image, e.event_date, e.event_time, e.content, e.created_at, c.category_title, t.tag_title FROM event e INNER JOIN category c on c.category_id = e.category_id INNER JOIN tag t on t.tag_id = e.tag_id INNER JOIN user u on u.user_id = e.user_id ORDER BY e.created_at DESC', 
                (err, results) => {
                    console.log(results);
                    if (err)
                        console.log(err);
                    res.render('event', {
                        sess: sess,
                        events: results,
                        title: 'Events'
                    });
                });
            }
        });
    } else {
        db.query('SELECT u.first_name, u.last_name, e.title, e.image, e.event_date, e.event_time, e.content, e.created_at, c.category_title, t.tag_title FROM event e INNER JOIN category c on c.category_id = e.category_id INNER JOIN tag t on t.tag_id = e.tag_id INNER JOIN user u on u.user_id = e.user_id ORDER BY e.created_at DESC', 
        (err, results) => {
            console.log(results);
            if (err)
                console.log(err);
            res.render('event', {
                sess: sess,
                events: results,
                title: 'Events'
            });
        });
    }
});

// Route to Submit an Event => from Create Event button
router.post('/submitEvent', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const title = req.body.title;
    const image = req.body.image;
    const eventDate = req.body.eventDate;
    const eventTime = req.body.eventTime;
    const content = req.body.content;
    const category = req.body.category;
    const tag = req.body.tag;   
    db.query("INSERT INTO event (user_id,title,image,event_date,event_time,content,category_id,tag_id,created_at) VALUES ((SELECT user_id FROM user WHERE email='"+ sess.email +"'),'"+ title +"','"+ image +"','" + eventDate + "','" + eventTime + "','"+ content +"',(SELECT category_id FROM category WHERE category_title='" + category + "'),(SELECT tag_id FROM tag WHERE tag_title='" + tag + "'),'"+ date +"')", 
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was posted!")
    });
    db.query('SELECT u.first_name, u.last_name, e.title, e.image, e.event_date, e.event_time, e.content, e.created_at, c.category_title, t.tag_title FROM event e INNER JOIN category c on c.category_id = e.category_id INNER JOIN tag t on t.tag_id = e.tag_id INNER JOIN user u on u.user_id = e.user_id ORDER BY e.created_at DESC', 
    (err, results) => {
        console.log(results);
        if (err)
            console.log(err);
        res.render('event', {
            sess: sess,
            events: results,
            title: 'Events'
        });
    });
});

// Create Post Page Route => includes RBAC controls
router.get('/createPost', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    if (sess != null) {
        db.query('SELECT role FROM user WHERE email = ?', 
        [sess.email], 
        (err, results) => {
            var temp = results[0].role;
            if (err)
                console.log(err);
            else if (temp == 'Contributor' || temp == 'Admin') {
                db.query("SELECT category_title FROM category",
                (err, categories) => {
                    if (err)
                        console.log(err);
                    db.query("SELECT tag_title FROM tag", 
                    (err, tags) => {
                        if (err)
                            console.log(err);
                        res.render('createPost', {
                            sess: sess,
                            categories: categories,
                            tags: tags,
                            title: 'Create a Post'
                        });
                    });
                });
            } else {
                db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
                (err, results) => {
                    if (err)
                        console.log(err);
                    res.render('blog', {
                        sess: sess,
                        posts: results,
                        date: date,
                        title: 'Blog'
                    });
                });
            }
        });
	} else {
        db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
        (err, results) => {
            if (err)
                console.log(err);
            res.render('blog', {
                sess: sess,
                posts: results,
                date: date,
                title: 'Blog'
            });
        });
    }
});

// Route to Submit an Post => from Create Post button
router.post('/submitPost', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const title = req.body.title;
    const image = req.body.image;
    const content = req.body.content;
    const category = req.body.category;
    const tag = req.body.tag;

    console.log(req.body.tag);

    db.query("INSERT INTO post (user_id,title,image,content,category_id,tag_id,created_at) VALUES ((SELECT user_id FROM user WHERE email='"+ sess.email +"'),'"+ title +"','"+ image +"','"+ content +"',(SELECT category_id FROM category WHERE category_title='" + category + "'),(SELECT tag_id FROM tag WHERE tag_title='" + tag + "'),'"+ date +"')",
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was posted!")
    });
    db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
    (err, results) => {
        if(err)
            console.log(err);
        res.render('blog', {
            sess: sess,
            posts: results,
            date: date,
            title: 'Blog'
        });
    });
});

// Create Category Page Route => includes RBAC controls
router.get('/createCategory', (req, res) => {
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    if (sess != null) {
        db.query('SELECT role FROM user WHERE email = ?', 
        [sess.email], 
        (err, results) => {
            var temp = results[0].role;
            if (err)
                console.log(err);
            else if (temp == 'Contributor' || temp == 'Admin') {
                res.render('createCategory', {
                    sess: sess,
                    title: 'Create a Category'
                });
            } else {
                db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
                (err, results) => {
                    if (err)
                        console.log(err);
                    res.render('blog', {
                        sess: sess,
                        posts: results,
                        date: date,
                        title: 'Blog'
                    });
                });
            }
        });
	} else {
        db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
        (err, results) => {
            if (err)
                console.log(err);
            res.render('blog', {
                sess: sess,
                posts: results,
                date: date,
                title: 'Blog'
            });
        });
    }
});

// Route to Submit an Category => from Create Category button
router.post('/submitCategory', (req, res) => {
    const name = req.params.name;
    const slug = req.params.slug;
    const description = req.params.description;
    db.query("INSERT INTO category (category_title, slug, description) VALUES ('" + name + "','" + slug + "','" + description + "')",
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
    const dateFormat = require('dateformat');
    const date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    if (sess != null) {
        db.query('SELECT role FROM user WHERE email = ?', 
        [sess.email], 
        (err, results) => {
            var temp = results[0].role;
            if (err)
                console.log(err);
            else if (temp == 'Contributor' || temp == 'Admin') {
                res.render('createTag', {
                    sess: sess,
                    title: 'Create a Tag'
                });
            } else {
                db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
                (err, results) => {
                    if (err)
                        console.log(err);
                    res.render('blog', {
                        sess: sess,
                        posts: results,
                        date: date,
                        title: 'Blog'
                    });
                });
            }
        });
	} else {
        db.query('SELECT u.first_name, u.last_name, p.title, p.image, p.content, p.created_at, c.category_title, t.tag_title FROM post p INNER JOIN category c on c.category_id = p.category_id INNER JOIN tag t on t.tag_id = p.tag_id INNER JOIN user u on u.user_id = p.user_id ORDER BY p.created_at DESC', 
        (err, results) => {
            if (err)
                console.log(err);
            res.render('blog', {
                sess: sess,
                posts: results,
                date: date,
                title: 'Blog'
            });
        });
    }
});

// Route to Submit a Tag => from Create Tag button
router.post('/submitTag', (req, res) => {
    const name = req.params.name;
    const slug = req.params.slug;
    const description = req.params.description;
    db.query("INSERT INTO tag (tag_title, slug, description) VALUES ('" + name + "','" + slug + "','" + description + "')",
    (err, results) => {
        if (err)
            console.log(err);
        console.log(results + " was added to tag!");
    });
    res.redirect('/createTag', {
        sess: sess,
        title: 'Create a Tag'
    });
});

module.exports = router;