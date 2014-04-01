define(["ko","fire-when-ready/javascripts/tax_brackets","highcharts","KOE","bootstrap"],function(e,t){function n(){function n(e){return Math.round(100*e)/100}function r(t){return{age:e.observable(t.age()+1),grossIncome:e.observable(t.grossIncome()),_401k:e.observable(t._401k()),roth:e.observable(t.roth()),afterTax:e.observable(t.afterTax()),principal:e.observable(n(t.valueAfterYears(1))),filingStatus:e.observable(t.filingStatus()),isExpanded:e.observable(!0)}}function a(){return i.isAdvanced()?"Value in Dollars":"Percent of Gross Income"}function s(){return i.isAdvanced()?"Age":"Years from Today"}var i=this;i.returnRate=e.observable(7),i.safeWithdrawalRate=e.observable(4),i.isAdvanced=e.observable(!1),i.filingStatuses=e.observable(t),i.simpleSavingsRate=e.observable(10),i.isAdvanced.subscribe(function(){$("#container").highcharts().yAxis[0].axisTitle.attr({text:a()}),$("#container").highcharts().xAxis[0].axisTitle.attr({text:s()})}),i.ages=e.computed(function(){for(var e=[],t=16;100>t;t++)e.push(t);return e}),i.snapshots=e.observableArray([{age:e.observable(22),grossIncome:e.observable(0),_401k:e.observable(0),roth:e.observable(0),afterTax:e.observable(0),principal:e.observable(0),filingStatus:e.observable(i.filingStatuses()[0]),isExpanded:e.observable(!0)}]),i.snapshots.subscribe(function(){$.each(i.snapshots(),function(t,r){r.panelTitle=e.computed(function(){return"Age: "+r.age()}),r.panelCollapseText=e.computed(function(){return r.isExpanded()?"Collapse":"Expand"}),r.togglePanel=function(){r.isExpanded(!r.isExpanded())},r.netIncome=e.computed(function(){var e=r.grossIncome()-r._401k(),t=0;return $.each(r.filingStatus().brackets,function(n,r){return e>=r.max?(t+=(r.max-r.min)*(1-r.rate),void 0):(t+=(e-r.min)*(1-r.rate),!1)}),n(t)}),r.yearlySpend=e.computed(function(){return n(r.netIncome()-r.roth()-r.afterTax())}),r.monthlySpend=e.computed(function(){return n(r.yearlySpend()/12)}),r.weeklySpend=e.computed(function(){return n(r.monthlySpend()/4)}),r.dailySpend=e.computed(function(){return n(r.monthlySpend()/30.4)}),r.yearlyInvestment=e.computed(function(){return n(+r._401k()+ +r.roth()+ +r.afterTax())}),r.requiredRetirementAmount=function(){return i.isAdvanced()?r.yearlySpend()/(i.safeWithdrawalRate()/100):(100-i.simpleSavingsRate())/.04},r.valueAfterYears=function(e){var t=0,n=.07,a=i.simpleSavingsRate();i.isAdvanced()&&(t=+r.principal(),n=+i.returnRate()/100,a=+r.yearlyInvestment());var s=1+n;return t*Math.pow(s,e)+a*((Math.pow(s,e+1)-s)/n)}})}),i.snapshotAges=e.computed(function(){var e=[],t=i.snapshots();return $.each(t,function(t,n){e.push(n.age())}),e.sort(function(e,t){return e-t})}),i.snapshots.valueHasMutated(),i.isDeleteVisible=e.computed(function(){return i.snapshots().length>1?!0:!1}),i.firstSnap=e.observable(i.snapshots()[0]),i.showSimple=function(){i.isAdvanced(!1)},i.showAdvanced=function(){i.isAdvanced(!0)},i.newSnapshot=function(){var e=i.snapshots()[i.snapshots().length-1];i.snapshots.push(r(e))},i.deleteSnapshot=function(e){var t=$.inArray(e,i.snapshots());i.snapshots.splice(t,1)},i.simpleRequiredRetirementAmount=function(){return(100-i.simpleSavingsRate())/.04},i.simpleValueAfterYears=function(e){var t=0,n=.07,r=i.simpleSavingsRate(),a=1+n;return t*Math.pow(a,e)+r*((Math.pow(a,e+1)-a)/n)},i.retirementAccountSeries=e.computed(function(){var e=[];if(i.isAdvanced())$.each(i.snapshotAges(),function(t,r){var a=50;if(t!==i.snapshotAges().length-1){var s=i.snapshotAges()[t+1];a=s-r}$.each(i.snapshots(),function(t,s){if(s.age()===r)for(var i=0;a>i;i++){var o=n(s.valueAfterYears(i));e.push([s.age()+i,o]),o>s.requiredRetirementAmount()&&a>i+10&&(a=i+10)}})});else for(var t=50,r=0;t>r;r++){var a=n(i.simpleValueAfterYears(r));e.push(a),a>i.simpleRequiredRetirementAmount()&&t>r+10&&(t=r+10)}return e}),i.requiredPortfolioSeries=e.computed(function(){var e=[];if(i.isAdvanced())$.each(i.snapshotAges(),function(t,r){var a=i.retirementAccountSeries().length-e.length;if(t!==i.snapshotAges().length-1){var s=i.snapshotAges()[t+1];a=s-r}$.each(i.snapshots(),function(t,s){if(s.age()===r)for(var i=0;a>i;i++)e.push([s.age()+i,n(s.requiredRetirementAmount())])})});else for(var t=0;t<i.retirementAccountSeries().length;t++)e.push(n(i.simpleRequiredRetirementAmount()));return e}),i.retirementAccountSeries.subscribe(function(e){$("#container").highcharts().series[0].setData(e)}),i.requiredPortfolioSeries.subscribe(function(e){$("#container").highcharts().series[1].setData(e)}),i.snapshotWeightedAverage=function(e){var t=i.retirementAccountSeries().length,r=0,a=0;return $.each(i.snapshotAges(),function(n,s){var o=t-r;if(n!==i.snapshotAges().length-1){var u=i.snapshotAges()[n+1];o=u-s,r+=o}$.each(i.snapshots(),function(t,n){n.age()===s&&(a+=n[e]()*o)})}),n(a/t)},i.netIncome=e.computed(function(){return i.snapshotWeightedAverage("netIncome")}),i.yearlySpend=e.computed(function(){return i.snapshotWeightedAverage("yearlySpend")}),i.monthlySpend=e.computed(function(){return i.snapshotWeightedAverage("monthlySpend")}),i.weeklySpend=e.computed(function(){return i.snapshotWeightedAverage("weeklySpend")}),i.dailySpend=e.computed(function(){return i.snapshotWeightedAverage("dailySpend")}),i.yearlyInvestment=e.computed(function(){return i.snapshotWeightedAverage("yearlyInvestment")}),$(function(){$("#container").highcharts({chart:{type:"line"},title:{text:null},yAxis:{title:{text:a()}},xAxis:{title:{text:s()}},series:[{name:"Portfolio Value",data:i.retirementAccountSeries()},{name:"Req. Portfolio Value",data:i.requiredPortfolioSeries()}],tooltip:{formatter:function(){if(i.isAdvanced()){var e="Age: "+this.x+"<br/>";return e.concat(this.series.name+": $"+this.y)}var e="Year: "+this.x+"<br/>";return e.concat(this.series.name+": "+this.y+"%")}}})})}$("#fire-when-ready-app").length>0&&e.applyBindings(new n,$("#fire-when-ready-app")[0])});