var url = require('url');

var async = require('async');
var { MongoClient } = require('mongodb');

var mongourl = "mongodb://localhost:27017/bk1803";

module.exports = {
	defaultRoute: ( req, res, next ) => {
	 res.render('login');
	},
    adminLoginAction: ( req, res, next ) => {
        var { username, password } = req.body;
        
        async.waterfall( [
            ( cb ) => {
                MongoClient.connect( mongourl, ( err, db ) => {
                    if ( err ) throw err;
                    cb( null, db );
                })
            },
            ( db, cb ) => {
                db.collection('admin').find( { username, password }, {} ).toArray( ( err, res ) => {
                    if ( err ) throw err;
                    if ( res.length > 0 ){
                        cb( null, 1)
                    }else {
                        cb( null, 0)
                    }
                })
            }
        ], ( err, result ) => {
            if ( result == 1){
                res.cookie('loginState', 1);
                res.redirect('/');
            } else {
                res.cookie('loginState', 0);
                res.redirect('/');
            }
        })
        
        
        // res.render('login');
    },
    adminLogOut: ( req, res, next ) => {
        res.cookie('loginState', 0);
        res.redirect('/');
    }
}
