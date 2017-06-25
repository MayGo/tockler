module.exports = {
  require: jest.genMockFunction(),
  match: jest.genMockFunction(),
  app: {
    getPath: () => {
      return '/tmp/mock_path';
    }
  },
  dialog: jest.genMockFunction(),

  remote: {
    getCurrentWindow: jest.genMockFunction(),

    dialog: {
      showSaveDialog: jest.genMockFunction()
    }
  }
};