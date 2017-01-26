import { Meteor } from 'meteor/meteor';
import { authorizer as Authorizer } from 's3up/server';

var authorizer = new Authorizer({
	key: 'key',
	secret: 'secret',
	// All other defaults go here
	bucket:"s3meteor",
	region:"us-west-2",
});

Meteor.methods({
	authorize_upload: function(ops) {
		this.unblock();
		return authorizer.authorize_upload(ops);
	},
	authorize_delete: function(ops) {
		this.unblock();
		return authorizer.authorize_delete(ops);
	},
})