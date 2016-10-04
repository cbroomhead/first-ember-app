import Ember from 'ember';


export default Ember.Controller.extend({
	msg: '',
	lat: '',
	lon: '',
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
			console.log("COORD OBJECT", coordobj);

		}
	}
});
