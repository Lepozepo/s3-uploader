import { noop, times } from 'lodash';
import series from 'promise.series';
import uploadFile from './uploadFile';

export default async function uploadFiles(_files, props = {}) {
  let files = _files;
  if (_files instanceof FileList) {
    files = Array.from(_files);
  }

  if (!files) throw new Error('uploadFiles(files): files argument is required!');

  const { blockSize = 5, onProgress = noop, ...fileProps } = props;

  const numFiles = files.length;
  const blocks = Math.ceil(numFiles / blockSize);

  const uploadPlan = times(blocks).map((blockId) => ({
    blockId,
    files: files.slice(blockId * blockSize, blockId * blockSize + blockSize).map((file, idx) => {
      const __id = idx + blockId * blockSize;

      if (file instanceof File) {
        return {
          __id,
          file,
        };
      }
      return {
        __id,
        file: file.file,
        passthroughProps: file,
      };
    }),
  }));

  const state = {
    list: {},
    toArray() {
      return Object.values(this.list);
    },
    total() {
      return this.toArray().reduce((acc, { total }) => acc + (total || 0), 0);
    },
    loaded() {
      return this.toArray().reduce((acc, { loaded }) => acc + (loaded || 0), 0);
    },
    percent() {
      // eslint-disable-next-line
      const r = Math.ceil(this.toArray().reduce((acc, { percent }) => ((acc + (percent / numFiles)) || 0), 0));
      return r > 100 ? 100 : r;
    },
  };

  await series(
    uploadPlan.map(
      (block) => () =>
        Promise.all(
          block.files.map((file) =>
            uploadFile(file.file, {
              ...fileProps,
              onProgress(progressState) {
                state.list[file.__id] = {
                  file,
                  ...file.passthroughProps,
                  ...state.list[file.__id],
                  ...progressState,
                };
                onProgress(state);
              },
            }),
          ),
        ),
    ),
  );

  return state;
}
