# S3 Uploads

## Sponsored by [Differential](http://www.differential.com)

### NOTES
This is an upgrade to the original atmosphere S3 project meant to work on React, React Native, and Blaze.
**THE API IS COMPLETELY DIFFERENT**

# Show your support!
Star my code in github or atmosphere if you like my code or shoot me a dollar or two!

[DONATE HERE](https://cash.me/$lepozepo)

## Installation

``` sh
$ npm i --save s3up
```
## After authorization, the upload goes directly from the client to S3
<img src="https://cdn.rawgit.com/CulturalMe/meteor-slingshot/master/docs/slingshot.png"/>

## How to use

### Step 1
Instantiate your Authorizer. **SERVER SIDE**

``` javascript
import { authorizer as Authorizer } from 's3up/server';

const authorizer = new Authorizer({
	key: 'key',
	secret: 'secret',
	// All other defaults go here
	bucket:"bucket",
	region:"region",
});
```

### Step 2
Set up your authorizers functions. Here is an example in Meteor. **SERVER SIDE**

``` javascript
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
```

### Step 3
Wire up your views with the upload and delete functions. Here is an example with Meteor Blaze's template events. **CLIENT SIDE**

``` javascript
import { upload_files, delete_files } from 's3up/client';

Template.example.events({
	'click .upload': function(event, instance) {
		upload_files(instance.$("input.file_bag")[0].files, {
			authorizer: Meteor.call.bind(this, "authorize_upload"),
			upload_event: function(err, res) {
				console.log({err, ...res});
				console.log(res.total_percent_uploaded);
			},
		});
	},
	'click .delete': function(event, instance) {
		delete_files({
			authorizer: Meteor.call.bind(this, "authorize_delete"),
			paths: ["someImage.jpg"],
			deleteComplete: function(err, res) {
				console.log({err, res});
			},
		})
	},
});
```

Notice how both `upload_files` and `delete_files` require an `authorizer` function to communicate with the server. In Meteor this is a `Meteor.method` but you can use anything.

## Create your Amazon S3

For all of this to work you need to create an aws account.

### 1. Create an S3 bucket in your preferred region.

### 2. Access Key Id and Secret Key

1. Navigate to your bucket
2. On the top right side you'll see your account name. Click it and go to Security Credentials.
3. Create a new access key under the Access Keys (Access Key ID and Secret Access Key) tab.
4. Enter this information into your app as defined in "How to Use" "Step 1".
5. Your region can be found under "Properties" button and "Static Website Hosting" tab.
	* bucketName.s3-website-**eu-west-1**.amazonaws.com.
	* If your region is "us-east-1" or "us-standard" then you don't need to specify this in the config.

### 3. Hosting

1. Upload a blank `index.html` file (anywhere is ok, I put it in root).
2. Select the bucket's properties by clicking on the bucket (from All Buckets) then the "Properties" button at the top right.
3. Click **"Static Website Hosting"** tab.
4. Click **Enable Website Hosting**.
5. Fill the `Index Document` input with the path to your `index.html` without a trailing slash. E.g. `afolder/index.html`, `index.html`
6. **Click "Save"**

### 4. CORS

You need to set permissions so that everyone can see what's in there.

1. Select the bucket's properties and go to the "Permissions" tab.
2. Click "Edit CORS Configuration" and paste this:

	``` xml
	<?xml version="1.0" encoding="UTF-8"?>
	<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
		<CORSRule>
			<AllowedOrigin>*</AllowedOrigin>
			<AllowedMethod>PUT</AllowedMethod>
			<AllowedMethod>POST</AllowedMethod>
			<AllowedMethod>GET</AllowedMethod>
			<AllowedMethod>HEAD</AllowedMethod>
			<MaxAgeSeconds>3000</MaxAgeSeconds>
			<AllowedHeader>*</AllowedHeader>
		</CORSRule>
	</CORSConfiguration>
	```

5. Click "Edit bucket policy" and paste this (**Replace the bucket name with your own**):

	``` javascript
	{
		"Version": "2008-10-17",
		"Statement": [
			{
				"Sid": "AllowPublicRead",
				"Effect": "Allow",
				"Principal": {
					"AWS": "*"
				},
				"Action": "s3:GetObject",
				"Resource": "arn:aws:s3:::YOURBUCKETNAMEHERE/*"
			}
		]
	}
	```

7. **Click Save**

### Note

It might take a couple of hours before you can actually start uploading to S3. Amazon takes some time to make things work.

Enjoy, this took me a long time to figure out and I'm sharing it so that nobody has to go through all that.

## API
[TODO]

#### Developer Notes
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html
https://github.com/Differential/meteor-uploader/blob/master/lib/UploaderFile.coffee#L169-L178

http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-auth-using-authorization-header.html
http://docs.aws.amazon.com/general/latest/gr/sigv4-signed-request-examples.html
https://github.com/CulturalMe/meteor-slingshot/blob/master/services/aws-s3.js

