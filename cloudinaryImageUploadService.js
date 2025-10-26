const { cloudUploader } = require("./config/db");
const uuid = require("uuid");

module.exports = {
  async cloudinaryImageUpload(filename) {
    try {
      // Set options for the upload
      const serverFilePath = `./uploads/${filename}`;
      const uploadOptions = {
        resource_type: "auto", // Automatically detect image/video/raw
        folder: "animecentral",
        public_id: uuid.v4(),
        tags: ["product"],
      };

      // Request upload to cloudinary service
      const uploadResult = await cloudUploader.upload(
        serverFilePath,
        uploadOptions
      );
      console.log(uploadResult);

      return {
        success: true,
        data: {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url,
          url: uploadResult.url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          created_at: uploadResult.created_at,
        },
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload image to Cloudinary",
      };
    }
  }
};
