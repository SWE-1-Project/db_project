'use strict';

var dbConn = require('../controllers/db.config');

var Tag = function(tag) {  
    this.name           = tag.name;  
    this.slug           = tag.slug;   
    this.description    = tag.description;  
};

Tag.create = function (newTag, result) {
    dbConn.query("INSERT INTO tag set ?", newTag, function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(err, null);
        } else {  
            console.log(res.insertId);  
            result(null, res.insertId);
        }
    });
};

Tag.findById = function (tag_id, result) {
    dbConn.query("Select * from tag where tag_id = ? ", tag_id, function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(err, null);
        } else {  
            result(null, res);
        }
    });
};

Tag.findAll = function (result) {
    dbConn.query("Select * from tag", function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(null, err);
        } else {  
            console.log('tag : ', res);  
            result(null, res);
        }
    });
};

Tag.update = function(tag_id, tag, result) {
    dbConn.query("UPDATE tag SET name=?,slug=?,description=? WHERE tag_id = ?", 
    [tag.name,tag.slug,tag.description, tag_id], 
    function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(null, err);
        } else {  
            result(null, res);
        }
    });
};

Tag.delete = function(tag_id, result){
    dbConn.query("DELETE FROM tag WHERE tag_id = ?", [tag_id], function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(null, err);
        } else {  
            result(null, res);
        }
    });
};

module.exports= Tag;