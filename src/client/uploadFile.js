import noop from 'lodash/noop';
import b64ToBlob from './b64ToBlob';

export default async function uploadFile(_file, props = {}) {
  if (!_file) throw new Error('file is required!');

  const {
    signer,
    onProgress = noop,
    isBase64 = false,
    base64ContentType,
  } = props;

  const signature = await signer(_file);
  if (!signature.fields || !signature.url) throw new Error('The signature did not return fields nor a url');

  let file = _file;
  if (isBase64) {
    file = b64ToBlob(_file, base64ContentType);
  }

  const form = new FormData();
  Object.entries(signature.fields).forEach(([k, v]) => {
    form.append(k, v);
  });
  form.append('file', file);

  let state = {};

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener(
      'progress',
      (event) => {
        state = {
          loaded: event.loaded,
          total: event.total,
          percent: Math.floor((event.loaded / event.total) * 100),
          status: 'uploading',
          fetching: true,
        };
        onProgress(state);
      },
      false,
    );

    xhr.addEventListener(
      'load',
      () => {
        if (xhr.status < 400) {
          state = {
            ...state,
            percent: 100,
            status: 'complete',
            fetching: false,
          };
          onProgress(state);
          resolve({
            url: `${signature.url}/${signature.fields.key}`,
            key: signature.fields.key,
          });
        } else {
          state = {
            ...state,
            status: 'error',
            fetching: false,
          };
          onProgress(state);
          reject();
        }
      },
    );

    xhr.open('POST', signature.url, true);
    xhr.send(form);
  });
}
