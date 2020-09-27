import { noop, times } from 'lodash';
import series from 'promise.series';
import uploadFile from './uploadFile';

export default async function uploadFiles(files, props = {}) {
  if (!(files instanceof FileList)) throw new Error('uploadFiles(files): files must be an instance of FileList');
  const {
    blockSize = 5,
    onProgress = noop,
    ...fileProps
  } = props;

  const numFiles = files.length;
  const blocks = Math.ceil(numFiles / blockSize);

  const uploadPlan = times(blocks).map((blockId) => ({
    blockId,
    files: Array.from(files)
      .slice(blockId * blockSize, (blockId * blockSize) + blockSize)
      .map((file, idx) => ({
        id: idx + (blockId * blockSize),
        file,
      })),
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
  times(numFiles).forEach((id) => {
    state.list[id] = { id };
  });

  await series(uploadPlan.map((block) => () => (
    Promise.all(block.files.map((file) => uploadFile(
      file.file,
      {
        ...fileProps,
        onProgress(progressState) {
          state.list[file.id] = progressState;
          onProgress(state);
        },
      },
    )))
  )));

  return state;
}
