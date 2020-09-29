import { useState } from 'react';
import { uploadFiles } from 's3up-client';

export default function useSignedUpload(props = {}) {
  const {
    signer,
    isBase64 = false,
    base64ContentType,
  } = props;

  const [state, setState] = useState({
    list: {},
    toArray: [],
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
        onProgress: (s) => setState({
          ...s,
          toArray: s.toArray(),
          loaded: s.loaded(),
          percent: s.percent(),
          status: 'uploading',
        }),
      });
      setState({
        ...r,
        toArray: r.toArray(),
        loaded: r.loaded(),
        percent: r.percent(),
        status: 'complete',
      });
      return state;
    } catch (error) {
      setState({
        ...state,
        toArray: state.toArray(),
        loaded: state.loaded(),
        percent: state.percent(),
        error,
        status: 'error',
      });
      return state;
    }
  };

  return [upload, state];
}
