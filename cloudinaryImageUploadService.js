const { cloudUploader } = require('./config/db');
const uuid = require('uuid');

module.exports = {
  async cloudinaryImageUpload(filename){
    try {
      // Set options for the upload
      const serverFilePath = `./uploads/${filename}`;
      const uploadOptions = {
        resource_type: 'auto', // Automatically detect image/video/raw
        folder: 'animecentral',
        public_id: uuid.v4(),
        tags: ['product'],
      };

      // Request upload to cloudinary service
      const uploadResult = await cloudUploader.upload(serverFilePath, uploadOptions);
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
        }
      };

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image to Cloudinary'
      };
    }
  },

  getFileIdFromUrl(secureUrl) {
    try {
      // Find the position of '/upload/' in the URL
      const uploadIndex = secureUrl.indexOf('/upload/');
      
      // Get everything after '/upload/' and split by '/' to get uuid + public_id (latter we want!)
      const afterUpload = secureUrl.substring(uploadIndex + 8); // 8 = length of '/upload/'
      const parts = afterUpload.split('/');
      
      // Join all parts after the version (index 1) to reconstruct the full public_id
      const publicIdWithExtension = parts.slice(1).join('/');
      console.log(`publicId with extension: ${publicIdWithExtension}`);

      // Remove file extension by finding the last dot
      const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
      const publicId = publicIdWithExtension.substring(0, lastDotIndex)
  
      console.log(`publicId is: ${publicId}`);
      return publicId;

    } catch (error) {
      console.error('Error extracting public_id from URL:', error);
      return null;
    }
  },

  async cloudinaryDeleteImage(publicId) {
    try {
      // Cue deletion of image via public id (from above fnc)
      const result = await cloudUploader.destroy(publicId, {
        resource_type: 'image'
      });

      // Return simple success message
      return {
        success: result.result === 'ok',
        data: result
      };

    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image from Cloudinary'
      };
    }
  }
}