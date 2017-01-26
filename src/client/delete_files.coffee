import noop from "lodash/noop"

export default ({authorizer, paths = [], deleteComplete = noop}) ->
	# Check required vars
	if not authorizer
		throw new Error "authorizer is required"

	authorizer {paths}, deleteComplete

