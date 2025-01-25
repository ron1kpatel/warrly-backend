import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import config from '../config/config.js';

cloudinary.config({
    cloud_name: config.CLOUDINARY.CLOUD_NAME,
    api_key: config.CLOUDINARY.API_KEY, // Fixed here
    api_secret: config.CLOUDINARY.API_SECRET
});

const getResourceType = (extension) => {
    const images = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videos = ['mp4', 'mov', 'avi'];
    return images.includes(extension) ? 'image' : 
           videos.includes(extension) ? 'video' : 'auto';
};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const fileExtension = localFilePath.split('.').pop().toLowerCase();
        const resourceType = getResourceType(fileExtension);

        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
            folder: 'receipts'
        });

        console.info(`File uploaded to Cloudinary: ${uploadResult.secure_url}`);
        
        await fs.unlink(localFilePath);
        return uploadResult;

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        try {
            if (localFilePath) await fs.access(localFilePath);
            await fs.unlink(localFilePath);
        } catch (fsError) {
            console.error('File cleanup error:', fsError);
        }
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };