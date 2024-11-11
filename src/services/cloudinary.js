import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const uploadOnCloudinary = async (localFilePath,resourceType = "auto") => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
    });

    // Remove the local file
    fs.unlinkSync(localFilePath);

    return response.secure_url;
  } catch (error) {
    
    // Attempt to remove the local file in case of error
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (unlinkError) {
    }

    return null;
  }
};

export { uploadOnCloudinary };