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
    files: times(blockSize).map((fileIdx) => ({
      id: fileIdx + (blockSize * fileIdx),
      file: files.item(fileIdx + (blockSize * fileIdx)),
    })),
  }));

  const state = {
    list: {},
    toArray() {
      return Object.values(this.list);
    },
    total: Object.values(files).reduce((acc, file) => acc + file.size, 0),
    loaded() {
      return this.toArray().reduce((acc, { loaded }) => acc + loaded, 0);
    },
    percent() {
      return Math.floor((this.loaded() / this.total) * 100);
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