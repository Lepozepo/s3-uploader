import b64toBlob from "./b64toBlob.coffee"
import uuid from "uuid/v4"

import isString from "lodash/isString"
import last from "lodash/last"
import isFunction from "lodash/isFunction"
import isEmpty from "lodash/isEmpty"
import noop from "lodash/noop"
import extend from "lodash/extend"

export default (file, {encoding = "", file_name = true, authorizer, path, acl, bucket, region, expiration, upload_event = noop}) ->
	# Check required vars
	if not authorizer
		throw new Error "authorizer is required"

	# Identify file
	if encoding is "base64" and isString file
		file = b64toBlob file

	# Identify file name
	switch typeof file_name
		when "boolean"
			extension = last file.name?.split(".")
			if not extension
				extension = file.type.split("/")[1] # a library of extensions based on MIME types would be better

			file_name = "#{uuid()}.#{extension}"

		when "function"
			file_name = upload_name(file)

	if isEmpty file_name
		file_name = file.name

	file_data =
		file:
			name:file_name
			type:file.type
			size:file.size
			original_name:file.name
		loaded:0
		total:file.size
		percent_uploaded:0
		status:"authorizing"

	upload_event null, file_data

	authorizer
		path:path
		acl:acl
		bucket:bucket
		region:region
		expiration:expiration
		file_name:file_name
		file_type:file.type
		file_size:file.size
		(error,signature) ->
			if error
				throw error

			# Prepare data
			form_data = new FormData()
			form_data.append "key", signature.key
			form_data.append "acl", signature.acl
			form_data.append "Content-Type",signature.file_type

			form_data.append "X-Amz-Date", signature.meta_date
			# form_data.append "x-amz-server-side-encryption", "AES256"
			form_data.append "x-amz-meta-uuid", signature.meta_uuid
			form_data.append "X-Amz-Algorithm", "AWS4-HMAC-SHA256"
			form_data.append "X-Amz-Credential", signature.meta_credential
			form_data.append "X-Amz-Signature",signature.signature

			form_data.append "Policy",signature.policy

			form_data.append "file",file

			# Send data
			xhr = new XMLHttpRequest()
			xhr.upload.addEventListener "progress", (event) ->
				upload_event null, extend file_data,
					loaded:event.loaded
					total:event.total
					percent_uploaded: Math.floor ((event.loaded / event.total) * 100)
					status:"uploading"
			,false

			xhr.addEventListener "load", () ->
				if xhr.status < 400
					upload_event null, extend file_data,
						percent_uploaded: 100
						url:signature.url
						secure_url:signature.secure_url
						relative_url:signature.relative_url
						status:"complete"
				else
					upload_event new Error("Upload Failed Request Failed"), extend file_data,
						status:"error"

			xhr.addEventListener "error", ->
				upload_event new Error("Upload Failed Network Error"), extend file_data,
					status:"error"

			xhr.addEventListener "abort", ->
				upload_event new Error("Upload Failed User Aborted"), extend file_data,
					status:"abort"

			xhr.open "POST",signature.post_url,true

			xhr.send form_data


