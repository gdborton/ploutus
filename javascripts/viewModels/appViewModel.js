// Main viewmodel class
define(['../../lib/knockout-2.3.0'], function(ko) {
    return function appViewModel() {
        var self = this;
        
        self.grossIncome = ko.observable(0);
        self.four01k = ko.observable(0);
        self.roth = ko.observable(0);
        self.afterTax = ko.observable(0);
    };
});