export default function upload(props, client) {
  return new Promise((resolve, reject) => {
    client.upload(props).send(
      (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      },
    );
  });
}
