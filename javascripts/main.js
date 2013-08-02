require.config({
    paths: {
        "lib": 'libraries',
        "highcharts": "libraries/highcharts"
    },
    shim: {
        'highcharts': {
            "exports": "Highcharts",
            "deps": ['lib/jquery']
        }
    }
});

require([ 'lib/koExternalTemplateEngine_all.min', 'viewModels/appViewModel'], function() {
    
});