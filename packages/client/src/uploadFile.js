/* eslint-disable curly */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable quotes */
import noop from "lodash/noop";
import b64ToBlob from "./b64ToBlob";

export default async function uploadFile(_file, props = {}) {
  if (!_file) throw new Error("file is required!");

  const {
    signer,
    onProgress = noop,
    isBase64 = false,
    base64ContentType,
  } = props;

  const signature = await signer(_file);
  if (!signature.fields || !signature.url)
    throw new Error("The signature did not return fields nor a url");
  signature.fields = {
    key: signature.fields.key,
    bucket: signature.fields.bucket,
    Policy: signature.fields.Policy,
    "X-Amz-Algorithm": signature.fields.xAmzAlgorithm,
    "X-Amz-Credential": signature.fields.xAmzCredential,
    "X-Amz-Date": signature.fields.xAmzDate,
    "X-Amz-Signature": signature.fields.xAmzSignature,
  };
  let file = _file;
  if (isBase64) {
    file = b64ToBlob(_file, base64ContentType);
  }

  const form = new FormData();
  Object.entries(signature.fields).forEach(([k, v]) => {
    form.append(k, v);
  });
  form.append("file", file);

  let state = {
    url: `${signature.url}/${signature.fields.key}`,
    key: signature.fields.key,
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener(
      "progress",
      (event) => {
        state = {
          ...state,
          loaded: event.loaded || 0,
          total: event.total || 0,
          percent: Math.floor((event.loaded / event.total) * 100) || 0,
        };
        onProgress(state);
      },
      false
    );

    xhr.addEventListener("load", () => {
      if (xhr.status < 400) {
        state = {
          ...state,
          percent: 100,
        };
        onProgress(state);
        resolve(state);
      } else {
        reject();
      }
    });

    xhr.open("POST", signature.url, true);
    xhr.send(form);
  });
}
