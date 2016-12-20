export default (b64Data, contentType, sliceSize) ->
	data = b64Data.split("base64,")
	if not contentType
		contentType = data[0].replace("data:","").replace(";","")

	contentType = contentType
	sliceSize = sliceSize or 512

	byteCharacters = atob data[1]
	byteArrays = []

	for offset in [0...byteCharacters.length] by sliceSize
		slice = byteCharacters.slice offset, offset + sliceSize
		byteNumbers = new Array slice.length

		for i in [0...slice.length]
			byteNumbers[i] = slice.charCodeAt(i)

		byteArray = new Uint8Array byteNumbers

		byteArrays.push byteArray

	blob = new Blob(byteArrays, {type: contentType})
	return blob
