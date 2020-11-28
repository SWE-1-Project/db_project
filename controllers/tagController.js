'use strict';
const Tag = require('../models/tag');

exports.findAll = function(req, res) {
    Tag.findAll(function(err, tag) {  
        console.log('controller')  
        if (err)  
            res.send(err);  
        console.log('res', tag);  
        res.send(tag);
    });
};
exports.create = function(req, res) {
    const new_tag = new Tag(req.body);
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
          res.status(400).send({ error:true, message: 'Please provide all required fields'});    
    } else {
        Tag.create(new_tag, function(err, tag) {
            if (err)  
                res.send(err);  
            res.json({error:false,message:"Tag added successfully!",data:tag});
        });
}};
exports.findById = function(req, res) {
    Tag.findById(req.params.id, function(err, tag) {  
        if (err)  
            res.send(err);  
        res.json(tag);
    });
};
exports.update = function(req, res) {  
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        res.status(400).send({ error:true, message: 'Please provide all required fields' });  
    } else {    
        Tag.update(req.params.id, new Tag(req.body), function(err, tag) {   
            if (err)   
                res.send(err);   
                res.json({ error:false, message: 'Tag successfully updated' });
     });
}};
exports.delete = function(req, res) {
    Tag.delete( req.params.id, function(err, tag) {  
        if (err)  
            res.send(err);  
        res.json({ error:false, message: 'Tag successfully deleted' });
    });
};