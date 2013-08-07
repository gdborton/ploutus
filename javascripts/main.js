require.config({
    paths: {
        "lib": 'libraries',
        "highcharts": "libraries/highcharts",
        "bootstrap": "libraries/bootstrap.min"
    },
    shim: {
        'highcharts': {
            "exports": "Highcharts",
            "deps": ['lib/jquery']
        },
        'bootstrap': {
            'deps': ['lib/jquery']
        }
    }
});

require([ 'lib/koExternalTemplateEngine_all.min', 'viewModels/appViewModel'], function() {
    
});