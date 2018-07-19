'use strict'

const gulp = require('gulp')
const uglifyEs = require('gulp-uglify-es').default
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const gutil = require('gulp-util')

const _ = require('lodash')
const fs = require('fs')

gulp.task("default", function () {
  return gulp.src("src/**/*.js")
    // 这里可以启用 babel 转 es6 => es5
    // .pipe(babel({
      // presets: ["env","react"],
      // minified: true
    // }))
    .pipe(uglifyEs({
      // 类型：Boolean 默认：true 是否修改变量名
      mangle: true,
      // 类型：Boolean 默认：true 是否完全压缩
      compress: true
    }))
    .on('error', (err) => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    //  打包后端代码不用 打包为一个
    // .pipe(concat('bundle.js'))
    .pipe(gulp.dest("tcp-server"));
});



const packageJson = require('./package.json')
const json = {
  "name": "tcp-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
  },
  "author": "",
  "dependencies": packageJson.dependencies
}


fs.writeFileSync('./tcp-server/package.json', JSON.stringify(json))
