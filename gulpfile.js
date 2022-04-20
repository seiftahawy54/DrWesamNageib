import gulp from "gulp";
import gulpSass from "gulp-sass";
import gulpImagemin from "gulp-imagemin";
import dartSass from "sass";
import gulpUglify from "gulp-uglify";
import gulpConcat from "gulp-concat";
import nodemon from "gulp-nodemon";
import path from "path";

const sass = gulpSass(dartSass);

gulp.task("minify", async () => {
  return gulp
    .src("public/imgs/non_imgs/**")
    .pipe(gulpImagemin())
    .pipe(gulp.dest("public/imgs/imgs"));
});

gulp.task("sassify", async () => {
  return gulp
    .src(path.resolve("public", "sass", "*"))
    .pipe(sass.sync({outputStyle: "compressed"}).on("error", sass.logError))
    .pipe(gulp.dest("public/css"));
});

gulp.task("start", async (done) => {
  return nodemon({
    script: "app.js",
    ext: "js",
    env: {NODE_ENV: "development"},
    done,
  })
    .on("start", () => {
      console.log("Server Started");
    })
    .on("restart", () => {
      console.log("restarted");
    })
    .on("error", () => {
      console.log("Something happened");
    });
});

gulp.task("watch", async () => {
  gulp.watch("sassify");
  // gulp.watch("start");
});

// gulp.task("default", ["minify"]);

// export default gulp;
