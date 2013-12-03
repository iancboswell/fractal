# Lightweight development server that provides browserify-on-demand

coffeeify = require 'coffeeify'
browserify = require 'connect-browserify'
express = require 'express'
connect = require 'connect'

app = express()

app.use(connect.compress())

app.get '/2D', browserify.serve
    entry: './src/main.coffee'

    ###shims:
        jquery:
            path: 'lib/jquery-1.9.1.js'
            exports: '$'
        jqueryui:
            path: 'lib/jquery-ui-1.10.3.custom.js'
            deps: ['jquery']###

    transforms: [coffeeify]

app.use '/', express.static "#{__dirname}/"
app.use '/', express.directory "#{__dirname}/"

connect.createServer(app).listen(8000)

console.log "Listening on port 8000."