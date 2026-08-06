const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const fileController = require("../controller/fileController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  fileController.uploadFile
);

router.get(
  "/",
  authMiddleware,
  fileController.getFiles
);
router.get(
  "/:id/download",
  authMiddleware,
  fileController.downloadFile
);

router.delete(
  "/:id",
  authMiddleware,
  fileController.deleteFile
);
module.exports = router;