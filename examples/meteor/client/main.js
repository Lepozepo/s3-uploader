import { Template } from 'meteor/templating';
import './main.html';
import { upload_files } from 's3up';

var progress = new ReactiveVar(0);

Template.info.helpers({
	'progress': function() {
		progress.get();
	},
})

Template.info.events({
	'click .upload': function(event, instance) {
		upload_files(instance.$("input.file_bag")[0].files, {
			authorizer: Meteor.call.bind(this, "authorize_upload"),
			upload_event: function(err, res) {
				progress.set(res.total_percent_uploaded);
			},
			// encoding: "base64",
		});
	},
	// 'click .remove': function(event, instance) {
	// 	remove_files({
	// 		urls: ["relative_url_1", "relative_url_2"],
	// 		removeComplete: function(err, res) {},
	// 	})
	// },
});
