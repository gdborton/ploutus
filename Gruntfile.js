module.exports = function (grunt) {
    'use strict';

	//https://github.com/gruntjs/grunt-contrib-requirejs
	grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		requirejs: {
			compile: {
				options: {
					appDir: 'src/',
					mainConfigFile: 'src/fire-when-ready/javascripts/main.js',
					dir: 'dist/'
				}
			}
		}
    });

    grunt.registerTask('default', ['requirejs:compile']);
};