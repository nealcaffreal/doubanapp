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
			res.render('casts', {
				result,
				len,
				limitNum: len,
				skipNum: 1,
				totalNum: 1
			});
		})
		
		
	 
	},
	pagingRoute: ( req, res, next) => {
		var { limitNum, skipNum } = url.parse( req.url, true ).query;
		limitNum = limitNum * 1 || 5;
		skipNum = skipNum * 1 || 0;
//         limitNum = limitNum <= 0 ? 5 : limitNum;
//         skipNum = skipNum <= 0 ? 0 : skipNum;
        if ( limitNum <=0 || skipNum < 0) {
            res.redirect('/castspaging?limitNum=5&skipNum=0')
        }else{
            async.waterfall( [
                ( cb ) => {
                    MongoClient.connect( mongourl, ( err, db ) => {
                        if ( err ) throw err;
                        cb( null, db );
                    })
                },
                ( db, cb ) => {
                    //mongodb 处理分页
    // 				db.collection('casts').find( {}, {} ).limit( limitNum ).skip( limitNum * skipNum ).toArray( ( err, res ) => {
    // 					if ( err ) throw err;
    // 					cb( null, res );
    // 					db.close();
    // 				})
                    //js处理分页  - --  
                    //拿到全部的数据，res
                    //求得全部数据的长度 listLen
                    //截取当前页面的数据 data     res.splice()   ----  返回的是截取的数据
                    db.collection('casts').find( {}, {} ).toArray( ( err, res ) => {
                        if ( err ) throw err;
                        var listLen = res.length;
                        //从哪开始截取，截取多少个，对应的是mongodb中的limit()和skip()
                        var data = res.splice( limitNum * skipNum,  limitNum );
                        
                        cb( null, {
                            listLen,
                            data
                        })
                        db.close();
                    })
                }
            ], ( err, result ) => {
                /**
                 * var { listLen, data } = result;
                 listLen代表其这个数据库集合中所有数据的个数
                 data:当前页面所对应的数据列表
                 */
                var len = result.data.length; // 前端循环遍历数据的条件
                var totalNum = Math.ceil( result.listLen / limitNum ); //总共有多少页数据
                skipNum = skipNum + 1;
                res.render('casts', {
                    result: result.data,
                    len,
                    totalNum,
                    skipNum,
                    limitNum
                });
            })
        }
		
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
    }
}
