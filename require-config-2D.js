requirejs.config({
    //Automatically load modules from lib
    baseUrl: 'lib',
    paths: {
        src: '../src',
        jquery: 'jquery-1.9.1',
        jqueryui: 'jquery-ui-1.10.3.custom'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'jqueryui': {
            deps: ['jquery']
        }
    }
});

// Start main app logic
requirejs(['cs!src/2D'], function (main) {
    main.init();
});