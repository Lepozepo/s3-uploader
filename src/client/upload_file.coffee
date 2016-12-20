import b64toBlob from "./b64toBlob.coffee"
import uuid from "uuid/v4"

import isString from "lodash/isString"
import last from "lodash/last"

export default (file, {encoding = "", unique_name = true, }) ->
	if encoding is "base64" and isString file
		file = b64toBlob file

	if unique_name
		extension = last file.name?.split(".")
		if not extension
			extension = file.type.split("/")[1] # a library of extensions based on MIME types would be better

		file_name = "#{uuid()}.#{extension}"
	else
		# Left off here
		if _.isFunction(file.upload_name)
			file_name = file.upload_name(file)
		else if !_.isEmpty(file.upload_name)
			file_name = file.upload_name
		else
			file_name = file.name

	initial_file_data =
		file:
			name:file_name
			type:file.type
			size:file.size
			original_name:file.name
		loaded:0
		total:file.size
		percent_uploaded:0
		uploader:ops.uploader
		status:"signing"

	id = S3.collection.insert initial_file_data

	ops.connection.call "_s3_sign",
		path:ops.path
		file_name: initial_file_data.file.name
		file_type:file.type
		file_size:file.size
		acl:ops.acl
		bucket:ops.bucket
		region:ops.region
		expiration:ops.expiration
		(error,result) ->
			if result
				# Mark as signed
				S3.collection.update id,
					$set:
						status:"uploading"

				# Prepare data
				form_data = new FormData()
				form_data.append "key", result.key
				form_data.append "acl", result.acl
				form_data.append "Content-Type",result.file_type

				form_data.append "X-Amz-Date", result.meta_date
				# form_data.append "x-amz-server-side-encryption", "AES256"
				form_data.append "x-amz-meta-uuid", result.meta_uuid
				form_data.append "X-Amz-Algorithm", "AWS4-HMAC-SHA256"
				form_data.append "X-Amz-Credential", result.meta_credential
				form_data.append "X-Amz-Signature",result.signature

				form_data.append "Policy",result.policy

				form_data.append "file",file

				# Send data
				xhr = new XMLHttpRequest()

				xhr.upload.addEventListener "progress", (event) ->
						S3.collection.update id,
							$set:
								status:"uploading"
								loaded:event.loaded
								total:event.total
								percent_uploaded: Math.floor ((event.loaded / event.total) * 100)
					,false

				xhr.addEventListener "load", ->
					if xhr.status < 400
						S3.collection.update id,
							$set:
								status:"complete"
								percent_uploaded: 100
								url:result.url
								secure_url:result.secure_url
								relative_url:result.relative_url

						callback and callback null,S3.collection.findOne id
					else
						callback and callback true,null

				xhr.addEventListener "error", ->
					callback and callback true,null

				xhr.addEventListener "abort", ->
					console.log "aborted by user"

				xhr.open "POST",result.post_url,true

				xhr.send form_data
			else
				callback and callback error,null