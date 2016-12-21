import upload_file from './upload_file.coffee'
import each from 'lodash/each'

export default (files, ops) ->
	each files, (file) ->
		upload_file(file, ops)

