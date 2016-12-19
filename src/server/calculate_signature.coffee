import Crypto, {HmacSHA256} from "crypto-js"
import moment from "moment"

export default ({policy, region, secret}) ->
	kDate = HmacSHA256(moment().format("YYYYMMDD"), "AWS4#{secret}")
	kRegion = HmacSHA256(region, kDate)
	kService = HmacSHA256("s3", kRegion)
	signature_key = HmacSHA256("aws4_request", kService)

	HmacSHA256 policy, signature_key
		.toString Crypto.enc.Hex

