var gulp = require('gulp');
var less = require('gulp-less');
var react = require('gulp-react');

gulp.task('less', function() {
    return gulp.src('animeta/static/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('animeta/static/build'));
});

gulp.task('jsx', function() {
    return gulp.src('animeta/static/js/*.react.js')
        .pipe(react({harmony: true}))
        .pipe(gulp.dest('animeta/static/build'));
});

gulp.task('watch', function() {
    gulp.watch('animeta/static/less/*.less', ['less']);
    gulp.watch('animeta/static/js/*.react.js', ['jsx']);
});

gulp.task('build', ['less', 'jsx']);
gulp.task('default', ['build', 'watch']);
