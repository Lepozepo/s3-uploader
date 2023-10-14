import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

export default function signUpload(props, client) {
  if (!props?.key) throw new Error(`key is required at signUpload({ key: ${props?.key} })`);
  if (!props?.bucket) throw new Error(`bucket is required at signUpload({ bucket: ${props?.bucket} })`);

  return createPresignedPost(client, {
    Bucket: props.bucket,
    Key: props.key,
    Expires: props.expires || 3600,
    Conditions: props.conditions,
    Fields: props.fields,
  });
}
