import { useState } from 'react';
import { uploadFiles } from 's3up-client';

export default function useSignedUpload(props = {}) {
  const { signer, isBase64 = false, base64ContentType } = props;

  const [state, setState] = useState({
    list: {},
    asArray: [],
    total: 0,
    loaded: 0,
    percent: 0,
    status: 'ready',
  });

  const upload = async (files) => {
    try {
      if (state.status === 'uploading') return state;

      const r = await uploadFiles(files, {
        signer,
        isBase64,
        base64ContentType,
        onProgress: (s) =>
          setState({
            ...s,
            asArray: s.toArray(),
            loaded: s.loaded(),
            total: s.total(),
            percent: s.percent(),
            status: 'uploading',
          }),
      });

      const finalState = {
        ...r,
        asArray: r.toArray(),
        loaded: r.loaded(),
        total: r.total(),
        percent: r.percent(),
        status: 'complete',
      };
      setState(finalState);
      return finalState;
    } catch (error) {
      const errorState = {
        error,
        status: 'error',
      };
      setState((prevState) => ({
        ...prevState,
        ...errorState,
      }));
      return error;
    }
  };

  return [upload, state];
}
