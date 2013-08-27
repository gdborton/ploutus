// Main viewmodel class
define(['lib/knockout', 'tax_brackets', 'highcharts', 'lib/koExternalTemplateEngine_all.min', 'bootstrap'], function(ko, taxBrackets) {
    function appViewModel() {
        var self = this;

        self.returnRate = ko.observable(7);
        self.safeWithdrawalRate = ko.observable(4);
        self.isAdvanced = ko.observable(false);
        self.filingStatuses = ko.observable(taxBrackets);


        self.snapshots = ko.observableArray([]);

        self.snapshots.push({
            grossIncome: ko.observable(0),
            _401k: ko.observable(0),
            roth: ko.observable(0),
            afterTax: ko.observable(0),
            principal: ko.observable(0),
            filingStatus: ko.observable(self.filingStatuses()[0])
        });

        self.firstSnap = ko.observable(self.snapshots()[0]);

        // Shows the simple view to the user.
        self.showSimple = function() {
            self.isAdvanced(false);
        };

        // Shows the advanced view to the user.
        self.showAdvanced = function() {
            self.isAdvanced(true);
        };

        // Calculates the net income after 401k contributions.
        self.netIncome = ko.computed(function() {
            var taxableIncome = (self.snapshots()[0].grossIncome() - self.snapshots()[0]._401k() );
            var returnValue = 0;
            
            $.each(self.snapshots()[0].filingStatus().brackets, function(index, bracket){
                if(taxableIncome >= bracket.max) {
                    returnValue += (bracket.max - bracket.min) * (1 - bracket.rate);
                } else {
                    returnValue += (taxableIncome - bracket.min) * (1 - bracket.rate);
                    return false; // Breaks the jQuery loop.
                }
            });
            
            return Round(returnValue);
        });

        // Calculates the yearly spend based on income not saved.
        self.yearlySpend = ko.computed(function() {
            return Round(self.netIncome() - self.snapshots()[0].roth() - self.snapshots()[0].afterTax());
        });

        // Calculates the monthly spend based on income not saved.
        self.monthlySpend = ko.computed(function() {
            return Round(self.yearlySpend() / 12);
        });

        // Calculates the weekly spend based on income not saved.
        self.weeklySpend = ko.computed(function() {
            return Round(self.monthlySpend() / 4);
        });

        // Calculates the daily spend based on inceom not saved.
        self.dailySpend = ko.computed(function() {
            return Round(self.monthlySpend() / 30.4);
        });

        // Calulates the sum of the years investments.
        self.yearlyInvestment = ko.computed(function() {
            return Round(+self.snapshots()[0]._401k() + +self.snapshots()[0].roth() + +self.snapshots()[0].afterTax());
        });
        
        // Returns the required retirement portfolio value.
        self.requiredRetirementAmount = function() {
            return self.yearlySpend() / (self.safeWithdrawalRate() / 100);
        };
        
        // Returns the series of retirement portfolio values.
        // Defaults to 50 years, but decreaes to FI + 10 when the FI year is found.
        self.retirementAccountSeries = ko.computed(function() {
            var series = [];
            var maxYears = 50;
            
            for (var year = 0; year < maxYears; year++) {
                var valueAfterYear = Round(valueAfterYears(year));
                series.push(valueAfterYear);
                
                if (valueAfterYear > self.requiredRetirementAmount() && year + 10 < maxYears)
                    maxYears = year + 10;
            }
            
            return series;
        });
        
        // Returns the series that represents the required retirement portfolio amount.
        self.requiredPortfolioSeries = ko.computed(function() {
            var series = [];
            
            for (var i = 0; i<self.retirementAccountSeries().length; i++) {
                series.push(Round(self.requiredRetirementAmount()));
            }
            
            return series;
        });
        
        // Replots the retirement account value when it changes.
        self.retirementAccountSeries.subscribe(function(newValue){
            $('#container').highcharts().series[0].setData(newValue);
        });
        
        // Replots the required amount when it changes.
        self.requiredPortfolioSeries.subscribe(function(newValue) {
            $('#container').highcharts().series[1].setData(newValue);
        });
        
        // Returns the number of years until user is able to retire.
        self.yearsTillIndependent = ko.computed(function() {
            var retirementYear = 100;
            $.each(self.retirementAccountSeries(), function(index, value) {
                if (value > self.requiredRetirementAmount()) {
                    retirementYear = index;
                    return false; // escapes the .each() loop.
                }
            });
            return retirementYear;
        });
        
        //  Returns the value of the retirement accounts after a specified number of years.
        //  Math for this method found at http://www.moneychimp.com/articles/finworks/fmbasinv.htm
        function valueAfterYears(years) {
            p = +self.snapshots()[0].principal();
            r = +self.returnRate()/100;
            c = +self.yearlyInvestment();
            
            var z = 1+r;
            
            return (p * Math.pow(z, years)) + c * ( (Math.pow(z, (years+1)) - z) / r);
        }
        
        // Rounds a number to a max of two decimal places.
        function Round(number) {
            return Math.round(number * 100) / 100;
        }
        
        // Creates the chart.
        $(function () { 
            $('#container').highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: null
                },
                yAxis: {
                    title: {
                        text: "Value in Dollars"
                    }
                },
                xAxis: {
                    title: {
                        text: 'Years from Today'
                    }
                },
                series: [
                    {
                        name: 'Portfolio Value',
                        data: self.retirementAccountSeries()
                    },
                    {
                        name: 'Req. Portfolio Value',
                        data: self.requiredPortfolioSeries()
                    }
                ],
                tooltip: {
                    formatter: function() {
                        var returnString = 'Year: ' + this.x + '<br/>';
                        return returnString.concat(this.series.name + ': $' + this.y);
                    }
                }
            });
        });
        
    }
    
    ko.applyBindings(new appViewModel());
});