import { Template } from 'meteor/templating';
import './main.html';
import { upload_files, delete_files } from 's3up/client';

var progress = new ReactiveVar(0);

Template.info.helpers({
	'progress': function() {
		return progress.get();
	},
})

Template.info.events({
	'click .upload': function(event, instance) {
		upload_files(instance.$("input.file_bag")[0].files, {
			authorizer: Meteor.call.bind(this, "authorize_upload"),
			upload_event: function(err, res) {
				console.log({err, ...res});
				console.log(res.total_percent_uploaded);
				if (err) throw err;

				progress.set(res.total_percent_uploaded);
			},
			// encoding: "base64",
		});
	},
	'click .delete': function(event, instance) {
		delete_files({
			authorizer: Meteor.call.bind(this, "authorize_delete"),
			paths: ["noExists.jpg"],
			deleteComplete: function(err, res) {
				console.log({err, res});
			},
		})
	},
});
