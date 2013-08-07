// Main viewmodel class
define(['lib/knockout', 'highcharts', 'lib/koExternalTemplateEngine_all.min', 'bootstrap'], function(ko) {
    function appViewModel() {
        var self = this;
        
        self.grossIncome = ko.observable(0);
        self._401k = ko.observable(0);
        self.roth = ko.observable(0);
        self.afterTax = ko.observable(0);
        self.principal = ko.observable(0);
        self.returnRate = ko.observable(0.07);
        self.safeWithdrawalRate = ko.observable(0.04);
        self.isAdvanced = ko.observable(false);
        self.simpleSavingsRate = ko.observable(10);
        
        self.isAdvanced.subscribe(function(newValue) {
            $('#container').highcharts().yAxis[0].axisTitle.attr({text: yAxisTitle()})
        });
        
        self.showSimple = function() {
            self.isAdvanced(false);
        };
        
        self.showAdvanced = function() {
            self.isAdvanced(true);
        };
        
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
        
        // Returns the required retirement portfolio value.
        self.requiredRetirementAmount = function() {
            if (self.isAdvanced()) {
                return self.yearlySpend() / self.safeWithdrawalRate();
            }
            else {
                return (100 - self.simpleSavingsRate()) / 0.04;
            }
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
            var p = 0;
            var r = 0.07;
            var c = self.simpleSavingsRate();
            
            if(self.isAdvanced()) {
                p = +self.principal();
                r = +self.returnRate();
                c = +self.yearlyInvestment();
            }
            
            var z = 1+r;
            
            return (p * Math.pow(z, years)) + c * ( (Math.pow(z, (years+1)) - z) / r);
        }
        
        // Rounds a number to a max of two decimal places.
        function Round(number) {
            return Math.round(number * 100) / 100;
        }
        
        // Returns the chart yAxis title, based on the context.
        function yAxisTitle() {
            if(self.isAdvanced()) {
                return 'Value in Dollars';
            }
            else {
                return 'Percent of Gross Income';
            }
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
                        text: yAxisTitle()
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
                        if(self.isAdvanced())
                            return returnString.concat(this.series.name + ': $' + this.y);
                        else
                            return returnString.concat(this.series.name + ': ' + this.y + '%');
                    }
                }
            });
        });
        
    }
    
    ko.applyBindings(new appViewModel());
});