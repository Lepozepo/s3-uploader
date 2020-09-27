export default function signUpload(props, client) {
  if (!props?.key) throw new Error(`key is required at signUpload({ key: ${props?.key} })`);
  if (!props?.bucket) throw new Error(`bucket is required at signUpload({ bucket: ${props?.bucket} })`);

  return new Promise((resolve, reject) => client.createPresignedPost({
    Bucket: props.bucket,
    Expires: props.expires || 3600,
    Conditions: props.conditions,
    Fields: {
      key: props.key,
      ...props.fields,
    },
  }, (err, res) => {
    if (err) return reject(err);
    return resolve(res);
  }));
}
