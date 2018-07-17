var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
			title: '<mark>Express</mark>',
			test: '测试111111',
			list: [
				"aaa", "bbb", "ccc"
			],
			flag: false
	});
});

router.get('/test', function(req, res, next) {
	//渲染了一个页面，index.ejs,传递了一个参数为title
  res.render('index', { title: 'Express' });
});

var arr = [1,2,3,4,4,5,6,7,8]; 
router.get('/hello', function(req, res, next) {
	
	res.send( arr );
});
module.exports = router;
