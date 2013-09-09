module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-release')


  grunt.config.init
    pkg: grunt.file.readJSON "package.json"
    coffee:
      default:
        files:
          "build/angular-tagger.js": "src/angular-tagger.coffee"
    uglify:
      options:
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      build:
        src: 'build/<%= pkg.name %>.js'
        dest: 'build/<%= pkg.name %>.min.js'
    release:
      options:
        npm: false
    watch:
      scripts:
        files: ['src/*']
        tasks: ['default']
    less:
      main:
        files:
          "build/angular-tagger.css": "src/angular-tagger.less"

  grunt.registerTask "default", ["coffee", "less", "uglify"]
