import { Meteor } from 'meteor/meteor';
import { Authorizer } from 's3-uploader';

var authorizer = new Authorizer({
	key: 'key',
	secret: 'secret',
	// All other defaults go here
});

Meteor.methods({
	authorize_upload: function(ops) {
		this.unblock();
		return authorizer.authorize(ops);
	},
})