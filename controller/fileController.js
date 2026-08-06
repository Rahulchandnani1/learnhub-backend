const fileService = require("../services/fileService");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const file = await fileService.saveFile(req.file);

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await fileService.getFiles();

    res.json(files);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.downloadFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.download(
      file.file_path,
      file.original_name
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete
exports.deleteFile = async (req, res) => {
  try {
    const file = await fileService.deleteFile(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};