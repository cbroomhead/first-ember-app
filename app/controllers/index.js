import Ember from 'ember';


export default Ember.Controller.extend({
	msg: '',
	update: '',
	ajax: Ember.inject.service(),
	actions : {
		handleClick () {
			this.send('getLocation');
		},
		getLocation: function(){
			var that = this;
				var onSuccess = function(position) {
  				that.send('getData', position.coords);
				};
			function onError(error) {
				console.log("ERROR", error);
			}
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}, 
		getData: function(coordobj){
			var that = this;
			//console.log("COORD OBJECT", coordobj.latitude, coordobj.longitude
			var store = this.store;
			var lat = coordobj.latitude;
			var lon = coordobj.longitude;
			var location = store.createRecord('index', 
				{ 
					latitude: lat,
					longitude: lon
				});

			location.save().then(function(newobj){
				that.send('loadData', newobj);
			});
		}, 
		loadData: function(newobj){
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
          			console.log("DATA", data);
          		}).catch(function(err){
          			console.log("ERROR", err);
          		})
		}
	}
});
