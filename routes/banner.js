var url = require('url');
var fs = require('fs');

var async = require('async');
var { MongoClient } = require('mongodb');

var mongourl = "mongodb://localhost:27017/bk1803";

module.exports = {
	defaultRoute: ( req, res, next ) => {
    
        res.render('banner');
	},
    addBannerRoute: ( req, res, next ) =>{
        res.render('banner_add');
    },
    addBannerAction: ( req, res, next ) =>{
//         console.log( req.file )
//         console.log( req.body )
        var bannerimg = req.file.filename + "." + req.file.mimetype.split('/')[1];
        
        var oldname = "./uploads/" + req.file.filename;
        var newname = "./uploads/" + bannerimg
       
       async.waterfall( [
           ( cb ) => {
               fs.rename( oldname, newname, ( err, data ) => {
                    if ( err ) throw err;
                     cb( null, bannerimg );
                })
           },
           ( bannerimg, cb ) => {
               MongoClient.connect( mongourl, ( err, db ) => {
               if ( err ) throw err;
                    console.log("bannerimg----", bannerimg );
                    cb( null, bannerimg, db );
               })
           },
           ( bannerimg, db, cb ) => {
               console.log("bannerimg+++++", bannerimg)
               var { bannerid, bannerurl } = req.body;
               var insertObj = {
                   bannerimg,
                   bannerid,
                   bannerurl
               }
               console.log(insertObj)
                db.collection('banner').insert( insertObj, ( err, data ) => {
                    if ( err ) throw err;
                    cb( null, "ok");
                    db.close();
                })
           }
       ], ( err, result ) => {
           if ( err ) throw err;
           if( result == "ok"){
               res.redirect('/banner')
           }
           
       })
        /**
         * 
         
         { fieldname: 'bannerimg',
  originalname: '党员教育培训.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: 'b752dbc2856609d250de6d10577f4292',
  path: 'uploads\\b752dbc2856609d250de6d10577f4292',
  size: 44683 }
{ banerid: '111', banerurl: 'http://www.aaa.com' }
         */
    },
}
