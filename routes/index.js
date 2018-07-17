var express = require('express');
var router = express.Router();

var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
})

var casts = require('./casts.js');
var directors = require('./directors.js');
var movie = require('./movie.js');
var banner = require('./banner.js');
var users = require('./users.js');
var admin = require('./admin.js');

var defaultRoute = ( req, res, next ) => {
    // console.log( req.cookies )
    // res.cookie('login', '1')
    if (  req.cookies.loginState == '1') {
        res.render('index');
	} else {
        res.render('login');
    }
}

/* GET home page. */
router.get('/', defaultRoute);

router.get('/casts', casts.defaultRoute);
router.get('/castspaging', casts.pagingRoute);
router.get('/deleteCastRoute', casts.deleteCastRoute);
router.get('/addCastRoute', casts.addCastRoute);
router.post('/addCastsAction', casts.addCastsAction);
router.get('/updateCastsRoute', casts.updateCastsRoute);
router.post('/updateCastsAction', casts.updateCastsAction);

router.get('/directors', directors.defaultRoute);

router.get('/movie', movie.defaultRoute);
//排序
router.get('/sortMovieRoute', movie.sortMovieRoute);
//区间查询
router.get('/areaQueryMovieRoute', movie.areaQueryMovieRoute);
//去重得到上映时间
router.get('/getYearMovie', movie.getYearMovie);
//搜索
router.get('/searchMovie', movie.searchMovie);

router.get('/banner', banner.defaultRoute);
router.get('/addBannerRoute', banner.addBannerRoute);
router.post('/addBannerAction', upload.single('bannerimg'), banner.addBannerAction);

router.get('/users', users.defaultRoute);

router.get('/admin', admin.defaultRoute);
router.post('/adminLoginAction', admin.adminLoginAction);
router.get('/adminLogOut', admin.adminLogOut);


module.exports = router;
