import S3 from 'aws-sdk/clients/s3';

export default function signUpload(props, s3Config) {
  if (!props?.key) throw new Error(`key is required at signUpload({ key: ${props?.key} })`);
  if (!props?.bucket) throw new Error(`bucket is required at signUpload({ bucket: ${props?.bucket} })`);

  const client = new S3({
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
    ...s3Config,
  });

  return client.createPresignedPost({
    Bucket: props.bucket,
    Expires: props.expires || 3600,
    Conditions: props.conditions,
    Fields: {
      key: props.key,
      ...props.fields,
    },
  }).promise();
}
