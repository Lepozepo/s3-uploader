import calculate_signature from "./calculate_signature.coffee"
import uuid from "uuid/v4"
import moment from "moment"
import isEmpty from "lodash/isEmpty"

###*
 * Creates an object for the client to consume as a signature to authorize a file upload into Amazon S3
 * @param {Object} ops Object describing how to create the signature
 * @param {Number} ops.expiration For how long is the signature valid?
 * @param {String} ops.path Where are we saving this to? A blank string is root, a folder is described without a starting or trailing slash
 * @param {String} ops.file_type What type of file is it?
 * @param {String} ops.file_name What name do you want the file to have?
 * @param {Number} ops.file_size How large is the file?
 * @param {String} ops.acl How will the file be accessed? ["private", "public-read", "public-read-write", "authenticated-read", "bucket-owner-read", "bucket-owner-full-control", "log-delivery-write"]
 * @param {String} ops.bucket The target Amazon AWS S3 bucket
 * @param {String} ops.region The region that your Amazon AWS S3 bucket belongs to
 * @return {Object}               Returns the signature object to use for uploading
###
class Authorizer
	constructor: ({@secret, @key, @bucket, @region = "us-east-1", @path = "", @expiration = 1800000, @acl = "public-read"}) ->

	authorize: ({expiration = @expiration, path = @path, file_type, file_name, file_size, acl = @acl, bucket = @bucket, region = @region}) ->
		expiration_date = new Date Date.now() + expiration
		expiration_date = expiration.toISOString()

		if isEmpty path
			key = "#{file_name}"
		else
			key = "#{path}/#{file_name}"

		meta_uuid = uuid()
		meta_date = "#{moment().format('YYYYMMDD')}T000000Z"
		meta_credential = "#{@key}/#{moment().format('YYYYMMDD')}/#{region}/s3/aws4_request"
		policy =
			"expiration":expiration_date
			"conditions":[
				["content-length-range",0,file_size]
				{"key":key}
				{"bucket":bucket}
				{"Content-Type":file_type}
				{"acl":acl}
				# {"x-amz-server-side-encryption": "AES256"}
				{"x-amz-algorithm": "AWS4-HMAC-SHA256"}
				{"x-amz-credential": meta_credential}
				{"x-amz-date": meta_date }
				{"x-amz-meta-uuid": meta_uuid}
			]

		# Encode the policy
		policy = new Buffer(JSON.stringify(policy), "utf-8").toString("base64")

		# Sign the policy
		signature = calculate_signature
			policy:policy
			region:region
			secret:@secret

		# Identify post_url
		if region is "us-standard" # This region does not exist but I can see how people can be confused about it
			region = "us-east-1"

		post_url = "https://s3-#{region}.amazonaws.com/#{bucket}"

		# Return authorization object
		policy:policy
		signature:signature
		access_key:@key
		post_url:post_url
		url:"#{post_url}/#{key}".replace("https://","http://")
		secure_url:"#{post_url}/#{key}"
		relative_url:"/#{key}"
		bucket:ops.bucket
		acl:ops.acl
		key:key
		file_type:ops.file_type
		file_name:ops.file_name
		meta_uuid:meta_uuid
		meta_date:meta_date
		meta_credential:meta_credential


