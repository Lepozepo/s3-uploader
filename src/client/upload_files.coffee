import upload_file from './upload_file'
import times from 'lodash/times'
import extend from "lodash/extend"

export default (files, ops) ->
	number_of_files = files.length
	upload_event = ops.upload_event
	total_percent_uploaded = 0

	upload_size = 0
	times number_of_files, (n) ->
		upload_size += files.item(n)?.size or 0

	times number_of_files, (n) ->
		upload_file files.item(n), extend ops,
			upload_event: (err, res) ->
				if err
					upload_event?(err, extend(res, {total_percent_uploaded}))
					total_percent_uploaded = 0
					return

				total_percent_uploaded += Math.floor ((res.loaded / upload_size) * 100)
				if total_percent_uploaded >= 100
					total_percent_uploaded = 100

				upload_event?(null, extend(res, {total_percent_uploaded}))
