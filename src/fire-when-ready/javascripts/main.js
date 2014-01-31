require.config({
	baseUrl: '.',
    paths: {
        "lib": '../bower_components',
        "highcharts": "../bower_components/highcharts/highcharts",
        "bootstrap": "../bower_components/bootstrap/dist/js/bootstrap",
		"viewModels": "fire-when-ready/javascripts/viewModels",
		"jQuery": "../bower_components/jquery/jquery",
		"ko": "../bower_components/knockout/knockout",
		"KOE": "../bower_components/koExternalTemplateEngine/lib/koExternalTemplateEngine-amd",
		"infuser": "../bower_components/infuser/lib/infuser-amd",
		"trafficCop": "../bower_components/TrafficCop/lib/amd/TrafficCop"
    },
    shim: {
		'jQuery': {
			"exports": '$'
		},
        'highcharts': {
            "exports": "Highcharts",
            "deps": ['jQuery']
        },
        'bootstrap': {
            'deps': ['jQuery']
        },
		'KOE': {
			'deps': ['infuser']
		}
    }
});

require(['viewModels/appViewModel'], function() {
    
});