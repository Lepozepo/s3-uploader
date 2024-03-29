import { S3Client } from '@aws-sdk/client-s3';
import download from './download';
import signUpload from './signUpload';
import upload from './upload';

export default class S3Up {
  constructor(props) {
    if (!props.bucket) throw new Error('bucket is required!');

    this.props = props;
    this.client = new S3Client({
      ...props,
      credentials: {
        accessKeyId: props.accessKeyId,
        secretAccessKey: props.secretAccessKey,
        ...props?.credentials,
      },
    });
  }

  signUpload(props) {
    return signUpload(
      {
        ...props,
        bucket: this.props.bucket,
      },
      this.client,
    );
  }

  download(props) {
    return download(
      {
        ...props,
        from: {
          ...props.from,
          bucket: this.props.bucket,
        },
      },
      this.client,
    );
  }

  upload(props) {
    return upload(
      {
        ...props,
        bucket: this.props.bucket,
      },
      this.client,
    );
  }
}
