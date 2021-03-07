var gulp = require('gulp');
var licenser = require('gulp-licenser');

var LICENSE_TEMPLATE =
  "/**\n" +
  "* timecheck node\n" +
  "*\n" +
  "* Copyright 2015, Jorne Roefs.\n" +
  "* All rights reserved.\n" +
  "*\n" +
  "*/";

var COMPONENT = "timecheck";

gulp.task("updateLicense", function() {
  gulp.src("./" + COMPONENT + "/*.js")
    .pipe(licenser(LICENSE_TEMPLATE))
    .pipe(gulp.dest("./" + COMPONENT + "/"));
});
