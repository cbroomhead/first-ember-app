import Ember from 'ember';


export default Ember.Controller.extend({
	msg: '',
	errormsg: '',
	ajax: Ember.inject.service(),
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
			//the only thing this function really does at this point is store some lat and lon values in the store. store values are not currently used later on.
			var that = this;
			var store = this.store;
			var lat = coordobj.latitude;
			var lon = coordobj.longitude;
			var location = store.createRecord('index', 
				{ 
					latitude: lat,
					longitude: lon
				});

			location.save().then(function(newobj){
				that.send('getBalAuth', newobj);
			});
		}, 
		getBalAuth: function(newobj){
			console.log("OBJCOORD", newobj._internalModel._data);
			var that = this;
			var store = this.store;
			var lat = newobj._internalModel._data.latitude;
			var lon = newobj._internalModel._data.longitude;
			var coorUrl = `https://api.watttime.org/api/v1/balancing_authorities/?loc={"type":"Point","coordinates":[${lon},${lat}]}`;
        	$.getJSON({
		          	url: coorUrl,
		          	type: 'get',
		          	headers: {
            			'Authorization': 'Token 902faab6d04cd6f4dd7cbca4acce9e28de92ea20'
          			}
          		}).then(function(data){
          			var name = data[0].name;
          			var abbrev = data[0].abbrev;
          			that.set('msg', `The name of the Balancing authority is ${name} (${abbrev})`);
          			that.send('getChartsData', abbrev);
          		}).catch(function(err){
          			that.set('errormsg','Something bad happened. Please trying again');
          		})
		},
		getChartsData: function(ba){
			var that = this;
			var store = this.store;
			$.getJSON({
		          	url: `https://api.watttime.org/api/v1/datapoints/?ba=${ba}&page=3&page_size=12`,
            		type: 'get'
          		}).then(function(data){
          			//console.log("DATA", data.results[0].genmix);
          			var stuff = data.results[0].genmix;
          			
          			var newCity = store.createRecord('index', {
          				chartsdata: stuff
          			})
          			console.log(newCity)
					that.send('displayCharts');

                }).catch(function(err){
          			console.log(err);
          		})
		},
		displayCharts: function(){
			var that = this;
			var store = this.store;
			console.log("INSIDE DISPLAY CHARTS");

			store.findAll('index').then(function(item){
				console.log(item.getEach('chartsdata'));
			item.map(function(ele){
				if(ele != undefined){
					console.log(ele._internalModel.store._data);
				}
			})

			})
		}
	}
});
