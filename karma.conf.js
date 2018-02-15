module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: [
      'jasmine'
    ],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ],
    files: [
      './node_modules/angular/angular.js',
      './src/**/*.spec.js'
    ],
    exclude: [],
    reporters: [
      'progress'
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  })
};
