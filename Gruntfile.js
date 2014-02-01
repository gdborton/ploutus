module.exports = function (grunt) {
    'use strict';

	grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/fire-when-ready'],
		requirejs: {
			compile: {
				options: {
					appDir: 'src/',
					mainConfigFile: 'src/fire-when-ready/javascripts/main.js',
					dir: 'dist/',
					optimize: 'uglify2',
                    paths: {
                        'requireLib': '../bower_components/requirejs/require'
                    },
					modules: [
                        {
                            name: 'fire-when-ready/javascripts/main',
                            include: ['fire-when-ready/javascripts/main', 'requireLib'],
                            create: true
                        }
                    ]
				}
			}
		}
    });

    grunt.registerTask('default', ['clean', 'requirejs:compile']);
};