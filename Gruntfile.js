module.exports = function (grunt) {
    'use strict';

	grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            less: ['dist/css/*.less']
        },
        less: {
            compile: {
                sourceMap: true,
                files: {
                    'dist/css/styles.css': 'dist/css/styles.less'
                }
            }
        },
		requirejs: {
			compile: {
				options: {
					appDir: 'src/',
					mainConfigFile: 'src/fire-when-ready/javascripts/main.js',
					dir: 'dist/',
					optimize: 'uglify2',
                    optimizeCss: 'none',
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

    grunt.registerTask('default', ['requirejs:compile', 'less:compile', 'clean:less']);
};