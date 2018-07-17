var url = require('url');

var async = require('async');
var { MongoClient } = require('mongodb');

var mongourl = "mongodb://localhost:27017/bk1803";

module.exports = {
	defaultRoute: ( req, res, next ) => {
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongourl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db );
				})
			},
			( db, cb ) => {
				db.collection('casts').find( {}, {} ).toArray( ( err, res ) => {
					if ( err ) throw err;
					cb( null, res );
					db.close();
				})
			}
		], ( err, result ) => {
			var len = result.length;
// 			res.render('casts', {
// 				result,
// 				len,
// 				limitNum: len,
// 				skipNum: 1,
// 				totalNum: 1
// 			});
      res.send(result)
		})
		
		
	 
	},
	pagingRoute: ( req, res, next) => {
		var { limitNum, skipNum } = url.parse( req.url, true ).query;
		limitNum = limitNum * 1 || 5;
		skipNum = skipNum * 1 || 0;
    async.waterfall( [
      ( cb ) => {
          MongoClient.connect( mongourl, ( err, db ) => {
              if ( err ) throw err;
              cb( null, db );
          })
      },
      ( db, cb ) => {
        console.log("11111111111111111111111")
          db.collection('casts').find( {}, {} ).toArray( ( err, res ) => {
              if ( err ) throw err;
              var data = res.splice( limitNum * skipNum,  limitNum );
              
              cb( null, data)
              db.close();
          })
      }
    ], ( err, result ) => {
      res.send(result)
    })
		
	},
	deleteCastRoute: ( req, res, next ) => {
		console.log( req.url )
		var { id, limitNum, skipNum } = url.parse( req.url, true ).query;
		// res.redirect( '/' );
		async.waterfall( [
			( cb ) => {
				MongoClient.connect( mongourl, ( err, db ) => {
					if ( err ) throw err;
					cb( null, db);
				})
			},
			( db, cb ) => {
				db.collection('casts').deleteOne( { id: id }, ( err, res ) => {
					if ( err ) throw err;
					cb( null, 'ok');
                    db.close();
				})
			}
		], ( err, result) => {
			if ( err ) throw err;
			if( result == 'ok'){
				// console.log("1111111111111111111111"+  req.url)
				skipNum = skipNum == 0 ? 0 : skipNum - 1
				 res.redirect( '/castspaging?limitNum='+limitNum+'&skipNum='+skipNum);
			}
		})
	},
	addCastRoute: ( req, res, next ) => {
		res.render('casts_add')
	},
	addCastsAction: ( req, res, next ) => {
		console.log( req.body )
		var obj = req.body;
		obj.avatars = {
　　　　　　　　　　　　"small":obj.img,
　　　　　　　　　　　　"large":obj.img,
　　　　　　　　　　　　"medium":obj.img
　　　　　　　　　　}
		var insertObj = obj;
		
		async.waterfall( [
			( cb ) => {
				//连接数据库，得到数据库
				MongoClient.connect( mongourl, ( err, db ) => {
					if ( err ) throw err;
					console.log( '数据库连接成功' )
					//传递db
					cb( null, db );
				})
			},
			( db, cb ) => {
				//给数据库中对用的集合（表）添加数据
				db.collection('casts').insert( insertObj, ( err, res ) => {
					if ( err ) throw err;
					console.log( 'insert success!' );
					//告诉最后一个回调函数，传递参数
					cb( null, 'ok');
					//关闭数据库
					db.close();
				}) 
			}
		], ( err, result) => {
			if ( err ) throw err;
			if ( result == "ok") {
				// console.log("插入数据成功");
				res.redirect('/castspaging?limitNum=5&skipNum=0');
			}
		})
	},
    updateCastsRoute: ( req, res, next ) => {
        var { id, limitNum, skipNum } = url.parse( req.url, true ).query;
        async.waterfall( [
        	( cb ) => {
        		MongoClient.connect( mongourl, ( err, db ) => {
        			if ( err ) throw err;
        			cb( null, db );
        		})
        	},
        	( db, cb ) => {
        		db.collection('casts').find( {id: id}, {_id: 0} ).toArray( ( err, res ) => {
        			if ( err ) throw err;
        			cb( null, res );
        			db.close();
        		})
        	}
        ], ( err, result ) => {
            //此处拿到的是只有一个元素的数组，所以为result[0]
            var { id, name, alt } = result[0];
            var img = result[0].avatars.small
        	res.render('casts_update', {
        		id,
        		name,
        		alt,
        		img,
                limitNum,
                skipNum
        	});
        })
    	// res.render('casts_update')
    },
    updateCastsAction: ( req, res, next) => {
        var obj = req.body;
        obj.avatars = {
　　　　　　　"small":obj.img,
　　　　　　　"large":obj.img,
　　　　　　　"medium":obj.img
　　　　 };
        var whereObj = {
            id: obj.id
        };
        var updateObj = {
            $set: {
                id: obj.id,
                avatars: obj.avatars,
                name: obj.name,
                alt: obj.alt
            }
        };
        
        async.waterfall( [
            ( cb ) => {
                MongoClient.connect( mongourl, ( err, db ) =>{
                   if ( err ) throw err;
                   cb( null, db );
                });
            },
            ( db, cb ) => {
                db.collection('casts').updateOne( whereObj, updateObj, ( err, res ) => {
                    if ( err ) throw err;
                    cb( null, 'ok');
                })
            }
        ], ( err, result ) =>{
            if ( err ) throw err;
            if( result == 'ok') {
                // res.send('<script> history.go(-2); location.reload()</script>')
                var skipNum = obj.skipNum == 0 ? 0 : obj.skipNum - 1;
                res.redirect('/castspaging?limitNum='+obj.limitNum+'&skipNum='+skipNum);
            }
        })
    },
    getCastsRoute: ( req, res, next ) => {
    		var { id } = url.parse( req.url, true ).query;
    		async.waterfall( [
    			( cb ) => {
    				MongoClient.connect( mongourl, ( err, db ) => {
    					if ( err ) throw err;
    					cb( null, db );
    				})
    			},
    			( db, cb ) => {
    				db.collection('casts').find( {id: id}, {_id: 0} ).toArray( ( err, res ) => {
    					if ( err ) throw err;
    					cb( null, res );
    					db.close();
    				})
    			}
    		], ( err, result ) => {
          if ( err ) throw err;
    				res.send(result)
    		})
    	// res.render('casts_update')
    },
    
}
