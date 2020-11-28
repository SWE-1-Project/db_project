'use strict';

var dbConn = require('../controllers/db.config');

var Category = function(category) {  
    this.name           = category.name;  
    this.slug           = category.slug;   
    this.description    = category.description;  
};

Category.create = function (newCategory, result) {
    dbConn.query("INSERT INTO category set ?", newCategory, function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(err, null);
        } else {  
            console.log(res.insertId);  
            result(null, res.insertId);
        }
    });
};

Category.findById = function (category_id, result) {
    dbConn.query("Select * from category where category_id = ? ", category_id, function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(err, null);
        } else {  
            result(null, res);
        }
    });
};

Category.findAll = function (result) {
    dbConn.query("Select * from category", function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(null, err);
        } else {  
            console.log('category : ', res);  
            result(null, res);
        }
    });
};

Category.update = function(category_id, category, result) {
    dbConn.query("UPDATE category SET name=?,slug=?,description=? WHERE category_id = ?", 
    [category.name,category.slug,category.description, category_id], 
    function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(null, err);
        } else {  
            result(null, res);
        }
    });
};

Category.delete = function(category_id, result){
    dbConn.query("DELETE FROM category WHERE category_id = ?", [category_id], function (err, res) {
        if (err) {  
            console.log("error: ", err);  
            result(null, err);
        } else {  
            result(null, res);
        }
    });
};

module.exports= Category;