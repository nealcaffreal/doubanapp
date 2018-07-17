var async = require('async');
var { MongoClient } = require('mongodb');

var mongourl = 'mongodb://localhost:27017/bk1803';

module.exports = {
	defaultRoute: ( req, res, next ) => {
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongourl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db);
				})
			},
			( db, cb ) => {
				db.collection('directors').find( {}, { 
					_id: 0
				}).toArray( ( err, res ) => {
					if ( err ) throw err;
					cb( null, res);
					db.close();
				})
			}
		], ( err, result ) => {
			console.log(  result )
			var len = result.length;
			res.render('directors', {
				result,
				len
			});
		})
		
		
		
		
	
	}
}
