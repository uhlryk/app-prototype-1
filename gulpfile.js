var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task("deploy_dev",function(){
	var deploy = require('./gulp/deploy/uhlryk_vipserv');
	gulp.start([deploy(gulp)]);
});

