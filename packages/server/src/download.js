import { GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

export default async function download(props, client) {
  if (!props?.to) throw new Error('download({ to: \'<path>\' }) is required');
  if (!props?.from?.key) throw new Error('download({ from: { key } }) is required');

  const rstream = await client.send(new GetObjectCommand({
    ...props.from,
    Key: props.from.key,
  }));

  return new Promise((resolve) => {
    const wstream = fs.createWriteStream(props.to);
    rstream.Body.pipe(wstream);
    wstream.on('finish', () => {
      resolve();
    });
  });
}
