import fs from 'fs';

export default function download(props, client) {
  if (!props?.to) throw new Error('download({ to: \'<path>\' }) is required');
  if (!props?.from) throw new Error('download({ from: {} }) is required');
  return new Promise((resolve) => {
    const wstream = fs.createWriteStream(props.to);
    const rstream = client.getObject(props.from).createReadStream();
    rstream.pipe(wstream);
    wstream.on('finish', () => {
      resolve();
    });
  });
}
