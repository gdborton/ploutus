// Main viewmodel class
define(['../../lib/knockout-2.3.0'], function(ko) {
    function appViewModel() {
        var self = this;
        
        self.grossIncome = ko.observable(0);
        self._401k = ko.observable(0);
        self.roth = ko.observable(0);
        self.afterTax = ko.observable(0);
        
        self.taxRate = ko.computed(function() {
            return 0.15;
        });
        
        self.netIncome = ko.computed(function() {
            return ( self.grossIncome() - self._401k() ) * ( 1 - self.taxRate() );
        });
        
        self.yearlySpend = ko.computed(function() {
            return self.netIncome() - self.roth() - self.afterTax();
        });
    };
    
    ko.applyBindings(new appViewModel())
});