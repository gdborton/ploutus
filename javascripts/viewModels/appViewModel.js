// Main viewmodel class
define(['lib/knockout', 'tax_brackets', 'highcharts', 'lib/koExternalTemplateEngine_all.min', 'bootstrap'], function(ko, taxBrackets) {
    function appViewModel() {
        var self = this;

        self.returnRate = ko.observable(7);
        self.safeWithdrawalRate = ko.observable(4);
        self.isAdvanced = ko.observable(false);
        self.filingStatuses = ko.observable(taxBrackets);
        self.simpleSavingsRate = ko.observable(10);

        self.isAdvanced.subscribe(function(newValue) {
            $('#container').highcharts().yAxis[0].axisTitle.attr({text: yAxisTitle()});
            $('#container').highcharts().xAxis[0].axisTitle.attr({text: xAxisTitle()});
        });

        self.ages = ko.computed(function() {
            var ages = [];
            for(var age = 16; age < 100; age++) {
                ages.push(age);
            }
            return ages;
        });

        self.snapshots = ko.observableArray([{
            age: ko.observable(22),
            grossIncome: ko.observable(0),
            _401k: ko.observable(0),
            roth: ko.observable(0),
            afterTax: ko.observable(0),
            principal: ko.observable(0),
            filingStatus: ko.observable(self.filingStatuses()[0]),
            isExpanded: ko.observable(true)
        }]);

        self.snapshots.subscribe(function(newArray) {
            $.each(self.snapshots(), function(index, snapshot) {

                snapshot.panelTitle = ko.computed(function(){
                    return "Age: " + snapshot.age();
                });

                snapshot.panelCollapseText = ko.computed(function() {
                    if (snapshot.isExpanded())
                        return "Collapse";
                    return "Expand";
                });

                snapshot.togglePanel = function() {
                    snapshot.isExpanded(!snapshot.isExpanded());
                };

                // Calculates the net income after 401k contributions.
                snapshot.netIncome = ko.computed(function() {
                    var taxableIncome = (snapshot.grossIncome() - snapshot._401k() );
                    var returnValue = 0;

                    $.each(snapshot.filingStatus().brackets, function(index, bracket){
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
                snapshot.yearlySpend = ko.computed(function() {
                    return Round(snapshot.netIncome() - snapshot.roth() - snapshot.afterTax());
                });

                // Calculates the monthly spend based on income not saved.
                snapshot.monthlySpend = ko.computed(function() {
                    return Round(snapshot.yearlySpend() / 12);
                });

                // Calculates the weekly spend based on income not saved.
                snapshot.weeklySpend = ko.computed(function() {
                    return Round(snapshot.monthlySpend() / 4);
                });

                // Calculates the daily spend based on inceom not saved.
                snapshot.dailySpend = ko.computed(function() {
                    return Round(snapshot.monthlySpend() / 30.4);
                });

                // Calculates the sum of the years investments.
                snapshot.yearlyInvestment = ko.computed(function() {
                    return Round(+snapshot._401k() + +snapshot.roth() + +snapshot.afterTax());
                });

                // Returns the required retirement portfolio value.
                snapshot.requiredRetirementAmount = function() {
                    if (self.isAdvanced())
                        return snapshot.yearlySpend() / (self.safeWithdrawalRate() / 100);

                    return (100 - self.simpleSavingsRate()) / 0.04;
                };

                //  Returns the value of the retirement accounts after a specified number of years.
                //  Math for this method found at http://www.moneychimp.com/articles/finworks/fmbasinv.htm
                snapshot.valueAfterYears = function (years) {
                    var p = 0;
                    var r = 0.07;
                    var c = self.simpleSavingsRate();

                    if(self.isAdvanced()) {
                        p = +snapshot.principal();
                        r = +self.returnRate()/100;
                        c = +snapshot.yearlyInvestment();
                    }

                    var z = 1+r;

                    return (p * Math.pow(z, years)) + c * ( (Math.pow(z, (years+1)) - z) / r);
                }

            });
        });

        self.snapshotAges = ko.computed(function(){
            var sortedArray = [];
            var snapshots = self.snapshots();
            $.each(snapshots, function(index, snapshot){
                sortedArray.push(snapshot.age());
            });

            return sortedArray.sort(function(a, b) { return a - b; });
        });

        self.snapshots.valueHasMutated(); // Calls subscribe function before the view loads to attach events.

        // Returns whether or not the delete snapshot button should be visible.
        // True if there is currently more than one snapshot, false otherwise.
        self.isDeleteVisible = ko.computed(function() {
            if (self.snapshots().length > 1)
                return true;
            return false;
        });

        // Returns the first snapshot in the snapshot array.
        self.firstSnap = ko.observable(self.snapshots()[0]);

        // Shows the simple view to the user.
        self.showSimple = function() {
            self.isAdvanced(false);
        };

        // Shows the advanced view to the user.
        self.showAdvanced = function() {
            self.isAdvanced(true);
        };

        // Pushes a new snapshot onto the snapshot array.
        self.newSnapshot = function(){
            var lastSnapshot = self.snapshots()[self.snapshots().length - 1]; // The last snapshot in the list.
            self.snapshots.push(cloneSnapshot(lastSnapshot));
        };

        // Deletes a snapshot from the snapshot array.
        self.deleteSnapshot = function(snapshot) {
            var snapshotIndex = $.inArray(snapshot, self.snapshots());
            self.snapshots.splice(snapshotIndex, 1);
        };

        // Returns the required retirement portfolio value.
        self.simpleRequiredRetirementAmount = function() {
            return (100 - self.simpleSavingsRate()) / 0.04;
        };

        //  Returns the value of the retirement accounts after a specified number of years.
        //  Math for this method found at http://www.moneychimp.com/articles/finworks/fmbasinv.htm
        self.simpleValueAfterYears = function (years) {
            var p = 0;
            var r = 0.07;
            var c = self.simpleSavingsRate();

            var z = 1+r;

            return (p * Math.pow(z, years)) + c * ( (Math.pow(z, (years+1)) - z) / r);
        }

        // Returns the series of retirement portfolio values.
        // Defaults to 50 years, but decreases to FI + 10 when the FI year is found.
        self.retirementAccountSeries = ko.computed(function() {
            var series = [];

            if(self.isAdvanced()){
                $.each(self.snapshotAges(), function(ageIndex, age) {
                    var maxYears = 50;

                    if ( ageIndex !== self.snapshotAges().length -1 ) {
                        var nextAge = self.snapshotAges()[ageIndex + 1];
                        maxYears = nextAge - age;
                    }

                    $.each(self.snapshots(), function(snapshotIndex, snapshot){
                        if (snapshot.age() === age) {
                            for (var year = 0; year < maxYears; year++) {
                                var valueAfterYear = Round(snapshot.valueAfterYears(year));
                                series.push([snapshot.age() + year, valueAfterYear]);

                                if (valueAfterYear > snapshot.requiredRetirementAmount() && year + 10 < maxYears)
                                    maxYears = year + 10;
                            }
                        }
                    });
                });
            }else{
                var maxYears = 50;
                for (var year = 0; year < maxYears; year++) {
                    var valueAfterYear = Round(self.simpleValueAfterYears(year));
                    series.push(valueAfterYear);

                    if (valueAfterYear > self.simpleRequiredRetirementAmount() && year + 10 < maxYears)
                        maxYears = year + 10;
                }
            }
            
            return series;
        });
        
        // Returns the series that represents the required retirement portfolio amount.
        self.requiredPortfolioSeries = ko.computed(function() {
            var series = [];

            if(self.isAdvanced()){
                $.each(self.snapshotAges(), function(ageIndex, age) {
                    var maxYears = self.retirementAccountSeries().length - series.length;

                    if ( ageIndex !== self.snapshotAges().length -1 ) {
                        var nextAge = self.snapshotAges()[ageIndex + 1];
                        maxYears = nextAge - age;
                    }

                    $.each(self.snapshots(), function(snapshotIndex, snapshot){
                        if (snapshot.age() === age) {
                            for (var years = 0; years < maxYears; years++) {
                                series.push([snapshot.age() + years, Round(snapshot.requiredRetirementAmount())]);
                            }
                        }
                    });
                });
            }else{
                for (var years = 0; years < self.retirementAccountSeries().length; years++) {
                    series.push(Round(self.simpleRequiredRetirementAmount()));
                }
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
            return 0;
            var retirementYear = 100;
            $.each(self.retirementAccountSeries(), function(index, value) {
                if (value > self.requiredRetirementAmount()) {
                    retirementYear = index;
                    return false; // escapes the .each() loop.
                }
            });
            return retirementYear;
        });

        // Rounds a number to a max of two decimal places.
        function Round(number) {
            return Math.round(number * 100) / 100;
        }

        // Returns a snapshot that is a clone of the one provided.
        function cloneSnapshot(originalSnapshot){
            return {
                age: ko.observable(originalSnapshot.age() + 1),
                grossIncome: ko.observable(originalSnapshot.grossIncome()),
                _401k: ko.observable(originalSnapshot._401k()),
                roth: ko.observable(originalSnapshot.roth()),
                afterTax: ko.observable(originalSnapshot.afterTax()),
                principal: ko.observable(originalSnapshot.principal()),
                filingStatus: ko.observable(originalSnapshot.filingStatus()),
                isExpanded: ko.observable(true)
            };
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

        // Returns the chart's xAxis title, based on the context.
        function xAxisTitle() {
            if(self.isAdvanced()) {
                return 'Age';
            }
            else {
                return 'Years from Today';
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
                        text: xAxisTitle()
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
                        if(self.isAdvanced()) {
                            var returnString = 'Age: ' + this.x + '<br/>';
                            return returnString.concat(this.series.name + ': $' + this.y);
                        }

                        var returnString = 'Year: ' + this.x + '<br/>';
                        return returnString.concat(this.series.name + ': ' + this.y + '%');
                    }
                }
            });
        });
        
    }
    
    ko.applyBindings(new appViewModel());
});