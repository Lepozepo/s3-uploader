# S3 Uploads

# Show your support!
Star my code in github or atmosphere if you like my code or shoot me a dollar or two!

[DONATE HERE](https://cash.me/$lepozepo)

## Installation

``` sh
<!-- On your server -->
$ npm i --save s3up-server
<!-- On your client -->
$ npm i --save s3up-client
```

## How to use

### Step 1
Instantiate your S3Up Instance. **SERVER SIDE**

``` javascript
import { S3Up } from 's3up-server';

const s3Up = new S3Up({
  // You may pass any of the parameters described in aws-sdk.S3's documentation
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: "bucketname", // required
});
```

[S3 parameters](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property)

### Step 2
Expose S3Up's methods to the client. Here is an example in Meteor. **SERVER SIDE**

``` javascript
Meteor.methods({
  authorizeUpload: function(ops) {
    this.unblock();
    // Do some checks on the user before signing the upload
    return s3Up.signUpload(ops);
  },
})
```

[signUpload parameters](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createPresignedPost-property)
Requires at least `key` to determine the target location of the upload

### Step 3
Wire up your views with the upload function. Here is an example with Meteor Blaze's template events. **CLIENT SIDE**

``` javascript
import { uploadFiles } from 's3up-client';

Template.example.events({
  'click .upload': function(event, instance) {
    uploadFiles(instance.$("input.file_bag")[0].files, {
      signer: (file) => new Promise((resolve, reject) => Meteor.call("authorizeUpload", { key: `someDirectory/${file.name}` }), (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      }),
      onProgress: function(state) {
        console.log(state);
        console.log(state.percent);
      },
    });
  },
});
```

## Create your Amazon S3

For all of this to work you need to create an aws account.

### 1. Create an S3 bucket in your preferred region.

### 2. Access Key Id and Secret Key

1. Navigate to your bucket
2. On the top right side you'll see your account name. Click it and go to Security Credentials.
3. Create a new access key under the Access Keys (Access Key ID and Secret Access Key) tab.
4. Enter this information into your app as defined in "How to Use" "Step 1".

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
      <AllowedMethod>GET</AllowedMethod>
      <MaxAgeSeconds>3000</MaxAgeSeconds>
      <AllowedHeader>*</AllowedHeader>
    </CORSRule>
  </CORSConfiguration>
  ```

3. Click "Edit bucket policy" and paste this (**Replace the bucket name with your own**):

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

4. **Click Save**

## API Server
`S3Up.signUpload`: For authorizing client side uploads
`S3Up.download`: For downloading files in s3 to your server
`S3Up.upload`: For uploading files stored in your server to s3

## API Client
`uploadFile`: For uploading a single file
`uploadFiles`: For uploading multiple files in batches (this makes sure the client doesn't run into any memory issues)
`useSignedUpload` (REACT only): For uploading files and managing state easily
