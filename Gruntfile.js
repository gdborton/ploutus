module.exports = function (grunt) {
    'use strict';

	//https://github.com/gruntjs/grunt-contrib-requirejs
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		copy: {
			requirejs: {
				src: 'bower_components/requirejs/require.js',
				dest: 'src/fire-when-ready/javascripts/require.js'
			}
		},
		requirejs: {
			compile: {
				options: {
					appDir: 'src/',
					mainConfigFile: 'src/fire-when-ready/javascripts/main.js',
					dir: 'dist/',
					optimize: 'uglify2',
					modules: [{name: 'fire-when-ready/javascripts/main'}]
				}
			}
		}
    });

    grunt.registerTask('default', ['copy:requirejs', 'requirejs:compile']);
};