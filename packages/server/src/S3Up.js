import S3 from "@aws-sdk/client-s3";
import signUpload from "./signUpload";
import download from "./download";
import upload from "./upload";

export default class S3Up {
  constructor(props) {
    if (!props.bucket) throw new Error("bucket is required!");

    this.props = props;
    this.client = new S3({
      ...props,
      params: {
        ...props?.params,
        Bucket: props.bucket,
      },
    });
  }

  signUpload(props) {
    return signUpload(
      {
        ...props,
        bucket: this.props.bucket,
      },
      this.client
    );
  }

  download(props) {
    return download(
      {
        ...props,
        from: {
          ...props.from,
          Bucket: this.props.bucket,
        },
      },
      this.client
    );
  }

  upload(props) {
    return upload(
      {
        ...props,
        Bucket: this.props.bucket,
      },
      this.client
    );
  }
}
