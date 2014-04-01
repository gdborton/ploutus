module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: ['dist'],
            less: ['dist/css/*.less'],
            compiled: ['css', 'static', 'build.txt', 'fire-when-ready']
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
                    mainConfigFile: 'src/static/javascripts/main.js',
                    dir: 'dist/',
                    optimize: 'uglify2',
                    optimizeCss: 'none',
                    paths: {
                        'requireLib': '../bower_components/requirejs/require'
                    },
                    modules: [
                        {
                            name: 'static/javascripts/main',
                            include: ['static/javascripts/main', 'requireLib'],
                            create: true
                        }
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'dist/', src: ['**'], dest: '.'}
                ]
            }
        }
    });

    grunt.registerTask('default', ['clean:dist', 'clean:compiled', 'requirejs:compile', 'less:compile', 'clean:less', 'copy:dist', 'clean:dist']);
};
