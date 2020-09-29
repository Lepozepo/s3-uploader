import { useState } from 'react';
export uploadFiles from 's3up-client/uploadFiles';

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
      if (state.status === 'uploading') return;

      const result = await uploadFiles(files, {
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
        ...result,
        status: 'complete',
      });
      return state;
    } catch (error) {
      setState({
        ...state,
        error,
        status: 'error',
      });
      return state;
    }
  };

  return [upload, state];
}
