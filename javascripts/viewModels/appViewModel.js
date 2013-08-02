// Main viewmodel class
define(['lib/knockout', 'lib/jquery', 'lib/koExternalTemplateEngine_all.min'], function(ko) {
    function appViewModel() {
        var self = this;
        
        self.grossIncome = ko.observable(0);
        self._401k = ko.observable(0);
        self.roth = ko.observable(0);
        self.afterTax = ko.observable(0);
        self.principal = ko.observable(0);
        self.returnRate = ko.observable(0.07);
        self.safeWithdrawalRate = ko.observable(.04);
        
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
        
        // Returns the value of the retirement accounts for years 0-100.
        self.retirementAccountSeries = ko.computed(function() {
            var series = [];
            self.yearlyInvestment();
            for (var i = 0; i<100; i++) {
                series.push(valueAfterYears(i))
            };
            return series;
        });
        
        // Returns the number of years until user is able to retire.
        self.yearsTillIndependent = ko.computed(function() {
            var retirementYear = 100;
            $.each(self.retirementAccountSeries(), function(index, value) {
                if (value * self.safeWithdrawalRate() > self.yearlySpend()) {
                    retirementYear = index;
                    return false; // escapes the .each() loop.
                }
            });
            return retirementYear;
        });
        
        //  Returns the value of the retirement accounts after a specified number of years.
        function valueAfterYears(years) {
            var p = +self.principal();
            var r = +self.returnRate();
            var z = 1+r;
            var c = +self.yearlyInvestment();
            
            return (p * Math.pow(z, years)) + c * ( (Math.pow(z, (years+1)) - z) / r);
            
            // Math for this method found at http://www.moneychimp.com/articles/finworks/fmbasinv.htm
        }
        
        function Round(number) {
            return Math.round(number * 100) / 100;
        }
    }
    
    ko.applyBindings(new appViewModel());
});






















