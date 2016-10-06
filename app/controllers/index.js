import Ember from 'ember';
import defaultTheme from '../themes/default-theme';


export default Ember.Controller.extend({
	msg: '',
	errormsg: '',
	ajax: Ember.inject.service(),
	piecharts: false,
	actions : {
		handleClick () {
			this.send('getLocation');
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
        	$.getJSON({
		          	url: coorUrl,
		          	type: 'get',
		          	headers: {
            			'Authorization': 'Token 91769eaee6281a836ce218415d151634e275b4f1'
          			}
          		}).then(function(data){
          			var name = data[0].name;
          			var abbrev = data[0].abbrev;
          			that.set('msg', `The name of the Balancing authority is ${name} (${abbrev})`);
          			that.send('getChartsData', abbrev);
          		}).catch(function(err){
          			//error should be handled. need to find a way to cause an error
          			that.set('errormsg','Something bad happened. Please trying again');
          		})
		},
		getChartsData: function(ba){
			var that = this;
			$.getJSON({
		          	url: `https://api.watttime.org/api/v1/datapoints/?ba=${ba}&page=5&page_size=12`,
            		type: 'get'
          		}).then(function(data){
	console.log("DATA IS HERE", data.results); //this is the array of results, code below  needs to be modified accordingly. 

          			if(data.statusText === "TOO MANY REQUESTS"){
          				console.log("TOO MANY REQUEST", data.statusText)
          			}
          			var args = data.results;
         			that.send('displayCharts', args)      			
                }).catch(function(err){
          			if(err.status === 429){
          				var errmesg = err.responseJSON.detail;
          				that.set('errormsg', `${errmesg}`);
          			}
          			else {
          				that.set('errormsg', 'Something bad happened. Please trying again');
          			}
          		})
		},
		displayCharts: function(args) {
			console.log("ARGS", args);
			var that = this;
			      var modelarr = [
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
			    	]
			    that.set('piecharts', true);
			    that.set('errormsg', 'We got something'); 
			    args.map(function(object){
			    	var blah = object.genmix.map(function(item){
				    	if (item.fuel === 'other'){
				    		console.log('other');
				           modelarr[0].data.push(item.gen_MW);
				        }
				        if (item.fuel === 'solar'){
				        	console.log('solar');
				           modelarr[1].data.push(item.gen_MW);
				        }
				        if (item.fuel === 'wind'){
				        	console.log('wind');
				           modelarr[2].data.push(item.gen_MW);
				        }
				        if (item.fuel === 'renewable'){
				        	console.log('renewable');
				           modelarr[3].data.push(item.gen_MW);
				        }
			        })
				})
							        console.log(blah);
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
		model : this.model,
		theme : defaultTheme
		}
});
