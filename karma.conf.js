module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine'],
    plugins: ['karma-babel-preprocessor'],
    files: [
      './node_modules/angular/angular.js',
      './src/ng-app.js',
      './src/**/*.spec.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'src/**/*.js': ['babel']
    },
    babelPreprocessor: {
      options: {
        presets: ['env'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  })
};
