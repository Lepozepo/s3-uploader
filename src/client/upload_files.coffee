import upload_file from "./upload_file"
import times from "lodash/times"
import extend from "lodash/extend"
import findIndex from "lodash/findIndex"
import reduce from "lodash/reduce"
import every from "lodash/every"

export default (files, ops) ->
	number_of_files = files.length
	upload_event = ops.upload_event
	total_percent_uploaded = 0

	files_data = []

	times number_of_files, (n) ->
		upload_file files.item(n), extend ops,
			upload_event: (err, res) ->
				if err
					upload_event?(err, extend(res, {total_percent_uploaded}))
					total_percent_uploaded = 0
					return

				if res.status is "authorizing"
					files_data.push(res)

				if res.status is "uploading"
					file_index = findIndex files_data, _id: res._id
					extend files[file_index], res

					upload_size = reduce files_data, (total, file) ->
						total + file.total
					,0

					total_percent_uploaded = reduce files_data, (total, file) ->
						total + Math.floor((file.loaded / file.total) * (file.total / upload_size) * 100)
					,0

				all_files_complete = every files_data,
					status: "complete"

				if all_files_complete
					total_percent_uploaded = 100

				upload_event?(null, extend(res, {total_percent_uploaded}))
