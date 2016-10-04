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
			console.log("COORD OBJECT", coordobj);

			var that = this;
			var store = this.store;

			var newCity = store.createRecord('index', {city: 'Hello worlds'});
			newCity.save().then(function(){
				that.send('loadData');
			});
		}, 
		loadData: function(){
			var that = this;
				var store = this.store;
				store.findRecord('index','lt3tk').then(function(data){
					console.log(data.get('city'));
				});
			that.send('changeData');
		}, 
		changeData: function(){
			var that = this;
			var store = this.store;
			store.findRecord('index','lt3tk').then(function(data){
					data.set('city', 'Hello world');
					data.save().then(function(){
							console.log(data.get('city'));
					});
				});
		}
	}
});
