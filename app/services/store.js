import DS from 'ember-data';

export default DS.Store.extend({
	city: DS.attr('string'),
	latitude: DS.attr('number'), 
	longitude: DS.attr('number')
});