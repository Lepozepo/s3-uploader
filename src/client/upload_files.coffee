import upload_file from './upload_file.coffee'
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
					throw err

				total_percent_uploaded += Math.floor ((res.loaded / upload_size) * 100)
				upload_event?(extend(res, {total_percent_uploaded}))
