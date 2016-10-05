import DS from 'ember-data';

export default DS.Store.extend({
	latitude: DS.attr('number'), 
	longitude: DS.attr('number'),
	chartsdata: DS.attr()
});