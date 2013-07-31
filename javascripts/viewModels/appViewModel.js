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
            return Round( self.grossIncome() - self._401k() ) * ( 1 - self.taxRate() );
        });
        
        self.yearlySpend = ko.computed(function() {
            return Round(self.netIncome() - self.roth() - self.afterTax());
        });
        
        self.monthlySpend = ko.computed(function() {
            return Round(self.yearlySpend() / 12);
        });
        
        self.weeklySpend = ko.computed(function() {
            return Round(self.monthlySpend() / 4);
        });
        
        self.dailySpend = ko.computed(function() {
            return Round(self.monthlySpend() / 30.4);
        });
        
        self.yearlyInvestment = ko.computed(function() {
            return Round(+self._401k() + +self.roth() + +self.afterTax());
        });
        
        function Round(number) {
            return Math.round(number * 100) / 100;
        }
    }
    
    ko.applyBindings(new appViewModel());
});