var gulp = require('gulp');
var shell = require('gulp-shell');
var todo = require('gulp-todo');

gulp.task("deploy_dev",function(){
	var deploy = require('./gulp/deploy/uhlryk_vipserv');
	gulp.start([deploy(gulp)]);
});

gulp.task('todo', function() {
	gulp.src(['app/**/*.js','tests/**/*.js', 'app.js', 'gulpfile.js'])
	.pipe(todo({
		verbose:true
	}))
	.pipe(gulp.dest('./'));
});