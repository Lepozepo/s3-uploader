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
      signer: (file) => new Promise((resolve, reject) => Meteor.call('authorizeUpload', (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      })),
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
NOTE: Do not block all public access unless you are planning to only use signed requests to get objects.

### 2. Access Key Id and Secret Key

1. Navigate to your bucket
2. On the top right side you'll see your account name. Click it and go to Security Credentials.
3. Create a new access key under the Access Keys (Access Key ID and Secret Access Key) tab.
4. Enter this information into your app as defined in "How to Use" "Step 1".

### 3. Enable CORS

Setting this will allow your website to POST data to the bucket. If you want to be more cautious, set the `AllowedOrigin` and `AllowedHeader` to your domain.

1. Select the bucket's properties and go to the "Permissions" tab.
2. Click "Edit CORS Configuration" and paste this:

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

3. Click "Edit bucket policy" and paste this (**Replace the bucket name with your own**) to allow anyone to read content from the bucket (only do this if you have set "block public access" to off):

``` javascript
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOURBUCKETNAME/*"
    }
  ]
}
```

4. **Click Save**

## API Server
`new S3Up(args)`: Class for handling data with your S3 Bucket. You may use other methods to authenticate the bucket as described [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property), this class takes in everything a common `S3` class takes and expands on it without extending it.
  `args.bucket` (required): Target bucket for all subsequent S3Up commands.
  `args.accessKeyId` (required unless authenticating with something else): IAM S3 User Access Key ID.
  `args.secretAccessKey` (required unless authenticating with something else): IAM S3 Secret Access Key

`S3Up.signUpload(args)`: For authorizing client side uploads [more docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createPresignedPost-property)
  `args.key` (required): The location of the file in S3.
  `args.expires` (optional): The number of seconds for which the presigned policy should be valid. (default: 3600)
  `args.conditions` (optional): An array of conditions that must be met for the presigned policy to allow the upload. This can include required tags, the accepted range for content lengths, etc.
  `args.fields` (optional): Fields to include in the form. All values passed in as fields will be signed as exact match conditions.

`S3Up.download(args)`: For downloading files in s3 to your server
  `args.to` (required): Location of file, does not check whether the directory exists, you'll need to take care of this yourself.
  `args.from.Key` (required): Key (ex: 'directory/thing.txt') of the S3 file
  `args.from.Range`: Portion of the file to get (generally not used) (ex: 'bytes=0-9').

`S3Up.upload(args)`: For uploading files stored in your server to s3
  `args.Body` (required): The file you're uploading (buffer, blob, or stream)
  `args.Key` (required): The location of the file you're uploading

## API Client
`uploadFile(file, args)`: For uploading a single file
  `file` (required): An instance of `File` as provided by HTML.input[type="file"]'s FileList
  `args.signer` (required): A function or async function that will call the server's `S3Up.signUpload()` function and return its full response (`{ url, fields }`).
  `args.onProgress(state)` (optional): A function for tracking upload progess
    `state.url`: The full location of the file once the upload is complete
    `state.key`: The key of the file in S3
    `state.loaded`: How many bytes have loaded up
    `state.total`: How many bytes will be loaded up
    `state.percent`: How much progress as a percentage [0-100] the upload has completed
  `args.isBase64` (optional): A boolean describing whether uploaded files need to be converted to a blob
  `args.base64ContentType` (optional): The content type of the base64 files

`uploadFiles(files, args)`: For uploading multiple files in batches (this makes sure the client doesn't run into any memory issues)
  `files` (required): An instance of `FileList` as provided by HTML.input[type="file"]
  `args.signer` (required): A function or async function that will call the server's `S3Up.signUpload()` function and return its full response (`{ url, fields }`).
  `args.onProgress(state)` (optional): A function for tracking upload progess
    `state.list`: An object of all files being uploaded
      `state.list[n].url`: The full location of the file once the upload is complete
      `state.list[n].key`: The key of the file in S3
      `state.list[n].loaded`: How many bytes have loaded up
      `state.list[n].total`: How many bytes will be loaded up
      `state.list[n].percent`: How much progress as a percentage [0-100] the upload has completed
    `state.toArray()`: A function that returns `state.list` as an array
    `state.total()`: A function that calculates current known total bytes to upload
    `state.loaded()`: A function that calculates current known total bytes uploaded
    `state.percent()`: A function that calculates current known progress of all uploads
  `args.isBase64` (optional): A boolean describing whether uploaded files need to be converted to a blob
  `args.base64ContentType` (optional): The content type of the base64 files


`const [upload, state] = useSignedUpload(args)` (REACT only): For uploading files and managing state easily
  `upload(FileList)`: A function that runs the uploads as described by `uploadFiles`
  `state`: The current state of uploads as described by `uploadFiles` but without requiring function calls
  `args`: The upload functions definition
    `args.signer` (required): A function or async function that will call the server's `S3Up.signUpload()` function and return its full response (`{ url, fields }`).
    `args.isBase64` (optional): A boolean describing whether uploaded files need to be converted to a blob
    `args.base64ContentType` (optional): The content type of the base64 files

