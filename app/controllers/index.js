import Ember from 'ember';
import defaultTheme from '../themes/default-theme';


export default Ember.Controller.extend({
	msg: '',
	errormsg: '',
	ajax: Ember.inject.service(),
	piecharts: false,
	isDisabled: true,
	spinner: false,
	actions : {
		handleClick () {
			this.set('isDisabled', false);
			this.send('getLocation');
			this.send('spinnerTrue');
		},
		resetEverything: function() {
			this.set('msg', '');
			this.set('errormsg', '');
			this.set('piecharts', false);
		},
		spinnerTrue: function(){
			this.set('spinner', true);
			var spin = document.getElementById("load");
			spin.toggle('true');
		},
		getLocation: function(){
			var that = this;
				var onSuccess = function(position) {
  				that.send('storeCoords', position.coords);
				};
			function onError(error) {
				console.log("ERROR", error);
			}
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}, 
		storeCoords: function(coordobj){ 
			var that = this;
			var store = this.store;
			var lat = coordobj.latitude;
			var lon = coordobj.longitude;
			var location = store.createRecord('index', 
				{ 
					latitude: lat,
					longitude: lon, 
					chartsdata: []
				});

			location.save().then(function(newobj){
				that.send('getBalAuth', newobj);
			});
		}, 
		getBalAuth: function(newobj){
			var that = this;
			var lat = newobj._internalModel._data.latitude;
			var lon = newobj._internalModel._data.longitude;
			var coorUrl = `https://api.watttime.org/api/v1/balancing_authorities/?loc={"type":"Point","coordinates":[${lon},${lat}]}`;
        	Ember.$.getJSON({
		          	url: coorUrl,
		          	type: 'get',
		          	headers: {
            			'Authorization': 'Token 91769eaee6281a836ce218415d151634e275b4f1'
          			}
          		}).then(function(data){
          			console.log("DATA BITCH", data)
          			var name = data[0].name;
          			var abbrev = data[0].abbrev;
          			that.set('msg', `Your Balancing authority is: ${name} (${abbrev})`);
          			that.send('getChartsData', abbrev);
          		}).catch(function(err){
          			that.set('errormsg','Somethings bad happened. Please trying again');
          			console.log(err);
          		});
		},
		getChartsData: function(ba){
			var that = this;
			Ember.$.getJSON({
		          	url: `https://api.watttime.org/api/v1/datapoints/?ba=${ba}&page=5&page_size=12`,
            		type: 'get'
          		}).then(function(data){
          			if(data.statusText === "TOO MANY REQUESTS"){
          				console.log("TOO MANY REQUEST", data.statusText);
          			} 
          			that.set('spinner', false);
          			var args = data.results;
         			that.send('displayCharts', args);   			
                }).catch(function(err){
          				var errmesg = err.responseJSON.detail;
          				that.set('errormsg', `${errmesg}`);	
          		});
		},
		displayCharts: function(args) {
			var that = this;
			      var modelArr = [
				      {
				        name: 'Other',
				        data: []
				      },
				      {
				        name: 'Solar',
				        data: []
				      },
				      {
				        name: 'Wind',
				        data: []
				      },
				      {
				        name: 'Renewable',
				        data: []
				      }
			    	];
			    that.set('piecharts', true); 
			    args.map(function(object){
			    	object.genmix.map(function(item){
				    	if (item.fuel === 'other'){
				           modelArr[0].data.push(item.gen_MW);
				        }
				        if (item.fuel === 'solar'){
				           modelArr[1].data.push(item.gen_MW);
				        }
				        if (item.fuel === 'wind'){
				           modelArr[2].data.push(item.gen_MW);
				        }
				        if (item.fuel === 'renewable'){
				           modelArr[3].data.push(item.gen_MW);
				        }
			        });
				});
			that.set('chartData', modelArr);
		},
	},
	chartOptions: {
			      chart: {
			        type: 'line'
			      },
			      title: {
			        text: 'Average Generation Mix'
			      },
			      subtitle: {
			        text: 'Source: WattTime API'
			      },
			      xAxis: {
			        tile : {
			          text: 'Time'
			        }
			      },
			      yAxis: {
			        title: {
			          text: 'Megawatts (MW)'
			        }
			      },
			      tooltip: {
			        valueSuffix: 'MW'
			      },
			      legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle',
			        borderWidth: 0
			      }
	},  		
	model : this.chartData,
	theme : defaultTheme
});
