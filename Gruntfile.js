module.exports = function (grunt) {
    'use strict';

	//https://github.com/gruntjs/grunt-contrib-requirejs
	grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    grunt.registerTask('default', []);
};