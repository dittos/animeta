var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function() {
    return gulp.src('animeta/static/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('animeta/static'));
});

gulp.task('watch', function() {
    gulp.watch('animeta/static/**/*.less', ['less']);
});

gulp.task('build', ['less']);
gulp.task('default', ['build', 'watch']);
