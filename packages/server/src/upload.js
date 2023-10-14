import { Upload } from '@aws-sdk/lib-storage';

export default function upload(props, client) {
  const { bucket, key, body, onProgress, ...ops } = props || {};

  // TODO: Improve with type checks
  if (!props?.key) throw new Error(`key is required at upload({ key: ${props?.key} })`);
  if (!props?.bucket) throw new Error(`bucket is required at upload({ bucket: ${props?.bucket} })`);
  if (!props?.body) throw new Error(`body is required at upload({ body: ${props?.body} })`);

  const uploader = new Upload({
    client,
    ...ops,
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
    },
  });

  if (onProgress) {
    uploader.on('httpUploadProgress', (progress) => {
      onProgress?.(progress);
    });
  }

  return uploader.done();
}
