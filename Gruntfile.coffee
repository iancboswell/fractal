module.exports = (grunt) ->
    # Project configuration
    grunt.initConfig {
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'build/2D.js': ['src/main.coffee']
                }
                options: {
                    transform: ['coffeeify']
                }
            }
        }

    }

    # Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks 'grunt-browserify'

    # Default task(s).
    grunt.registerTask 'default', ['browserify']        