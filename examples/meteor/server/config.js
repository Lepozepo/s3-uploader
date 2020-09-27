import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { S3Up } from 's3up-server';

const s3up = new S3Up({
  accessKeyId: Meteor.settings.accessKeyId,
  secretAccessKey: Meteor.settings.secretAccessKey,
  bucket: 's3upmeteor',
});

Meteor.methods({
  signUpload() {
    this.unblock();
    return s3up.signUpload({
      key: Random.id(),
    });
  },
})