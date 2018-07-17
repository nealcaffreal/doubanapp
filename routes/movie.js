var MongoClient = require('mongodb');
var async = require('async');
var url = require('url');

var mongoUrl ='mongodb://localhost:27017/bk1803';

module.exports = {
	defaultRoute: ( req, res, next ) => {
        async.waterfall([ 
            ( cb ) => {
                MongoClient.connect( mongoUrl, ( err, db ) => {
                    if ( err ) throw err;
                    cb( null, db );
                })
            },
            ( db, cb ) => {
              db.collection('movie').distinct('year', ( err, yearArr) => {
                if ( err ) throw err;
                cb( null, db, yearArr);
              })
            },
            ( db, yearArr, cb ) => {
                // yearArr
                db.collection('movie').find( {}, {} ).toArray( ( err, res ) => {
                    if ( err ) throw err;
                    cb( null, {
                        yearArr,
                        res
                    });
                    db.close();
                })
            }
        ],( err, result ) => {
            var len = result.res.length;
             res.render('movie', {
                 result: result.res,
                 len,
                 yearArr: result.yearArr
             });
        })
      
	},
    sortMovieRoute: ( req, res, next) => {
        var { type, num } = url.parse( req.url, true ).query;
        
//         var sortObj = {
//             "year": num * 1
//         }

//          var sortObj = {}
//         switch ( type ){
//         	case 'year':
//                  sortObj = { year: num}
//         		break;
//         	default:
//         		break;
//         }
        var sortObj = {};// style.display   style['display']
        sortObj[type] = num*1;
        
        async.waterfall([ 
        	( cb ) => {
        		MongoClient.connect( mongoUrl, ( err, db ) => {
        			if ( err ) throw err;
        			cb( null, db );
        		})
        	},
          ( db, cb ) => {
          	db.collection('movie').distinct('year', ( err, yearArr) => {
          		if ( err ) throw err;
          		cb( null, db, yearArr);
          	})
          },
        	( db, yearArr, cb ) => {
        		db.collection('movie').find( {}, {} ).sort( sortObj ).toArray( ( err, res ) => {
        			if ( err ) throw err;
        			cb( null, {
                res,
                yearArr
              });
        			db.close();
        		})
        	}
        ],( err, result ) => {
        	var len = result.res.length;
        	res.render('movie', {
        		result:result.res,
        		len,
        		yearArr: result.yearArr
        	});
        })
    },
    areaQueryMovieRoute: ( req, res, next ) => {
        
        var { type, min, max } = url.parse( req.url, true ).query;
        
        var whereObj = {}
        whereObj[type] = {
            $gte: min * 1,
            $lte: max * 1
        }
        async.waterfall([ 
        	( cb ) => {
        		MongoClient.connect( mongoUrl, ( err, db ) => {
        			if ( err ) throw err;
        			cb( null, db );
        		})
        	},
          ( db, cb ) => {
          	db.collection('movie').distinct('year', ( err, yearArr) => {
          		if ( err ) throw err;
          		cb( null, db, yearArr);
          	})
          },
        	( db, yearArr, cb ) => {
        		db.collection('movie').find( whereObj, {} ).toArray( ( err, res ) => {
        			if ( err ) throw err;
        			cb( null, {
                res,
                yearArr
              });
        			db.close();
        		})
        	}
        ],( err, result ) => {
        	var len = result.res.length;
        	res.render('movie', {
        		result:result.res,
        		len,
            yearArr: result.yearArr
        	});
        })
    },
    getYearMovie: ( req, res, next ) => {
      var { year } = url.parse( req.url, true ).query;
      
      async.waterfall([ 
      	( cb ) => {
      		MongoClient.connect( mongoUrl, ( err, db ) => {
      			if ( err ) throw err;
      			cb( null, db );
      		})
      	},
        ( db, cb ) => {
        	db.collection('movie').distinct('year', ( err, yearArr) => {
        		if ( err ) throw err;
        		cb( null, db, yearArr);
        	})
        },
      	( db, yearArr, cb ) => {
      		db.collection('movie').find( {year: year}, {} ).toArray( ( err, res ) => {
      			if ( err ) throw err;
      			cb( null, {
              res,
              yearArr
            });
      			db.close();
      		})
      	}
      ],( err, result ) => {
      	var len = result.res.length;
      	res.render('movie', {
      		result:result.res,
      		len,
          yearArr: result.yearArr
      	});
      })
    },
    searchMovie: ( req, res, next ) => {
       var { title } = url.parse( req.url, true ).query;
       async.waterfall([ 
       	( cb ) => {
       		MongoClient.connect( mongoUrl, ( err, db ) => {
       			if ( err ) throw err;
       			cb( null, db );
       		})
       	},
       	( db, cb ) => {
       		db.collection('movie').distinct('year', ( err, yearArr) => {
       			if ( err ) throw err;
       			cb( null, db, yearArr);
       		})
       	},
       	( db, yearArr, cb ) => {
       		db.collection('movie').find( {title: eval("/^"+title+"/")}, {} ).toArray( ( err, res ) => {
       			if ( err ) throw err;
       			cb( null, {
       				res,
       				yearArr
       			});
       			db.close();
       		})
       	}
       ],( err, result ) => {
       	var len = result.res.length;
       	res.render('movie', {
       		result:result.res,
       		len,
       		yearArr: result.yearArr
       	});
       })
    }
}
