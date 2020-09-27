import { Template } from 'meteor/templating';
import './main.html';
import { uploadFiles } from 's3up-client';

const progress = new ReactiveVar(0);

Template.info.helpers({
  'progress': function() {
    return progress.get();
  },
})

Template.info.events({
  'click .upload': function(event, instance) {
    uploadFiles(instance.$('input.file_bag')[0].files, {
      signer: (file) => new Promise((resolve, reject) => Meteor.call('signUpload', (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      })),
      onProgress(state) {
        console.log(state);
        console.log(state.percent());
        progress.set(state.percent());
      },
    });
  },
});
