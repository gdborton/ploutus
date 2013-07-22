require(['../lib/knockout-2.3.0', 'viewModels/appViewModel'], function(ko, appViewModel) {
    ko.applyBindings(new appViewModel());
});