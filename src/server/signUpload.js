import S3 from 'aws-sdk/clients/s3';

export default function signUpload(props, s3Config) {
  if (!props?.key) throw new Error(`key is required at signUpload({ key: ${props?.key} })`);

  let client;
  if (s3Config instanceof S3) {
    client = s3Config;
  } else {
    client = new S3({
      params: {
        Bucket: s3Config.bucket,
      },
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
      ...s3Config,
    });
  }

  return client.createPresignedPost({
    Expires: props.expires,
    Conditions: props.conditions,
    Fields: {
      key: props.key,
      ...props.fields,
    },
  }).promise();
}
