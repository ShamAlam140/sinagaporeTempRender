const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
let isConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    isConfigured = true;
    console.log('✅ Cloudinary initialized successfully');
} else {
    console.warn('⚠️ Cloudinary credentials not set. File upload features will not work.');
}

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer — the file buffer (from multer memoryStorage)
 * @param {string} folder — destination folder in Cloudinary (e.g. 'files', 'policies')
 * @param {string} filename — original filename (used as public_id base)
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
function uploadToCloudinary(buffer, folder, filename) {
    return new Promise((resolve, reject) => {
        // Strip the file extension for the public_id
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: nameWithoutExt,
                resource_type: 'auto', // auto-detect: image, video, raw (pdf, doc, etc.)
                overwrite: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId — the public_id stored in MongoDB
 * @returns {Promise<object>}
 */
function deleteFromCloudinary(publicId) {
    return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
}

module.exports = { cloudinary, isConfigured, uploadToCloudinary, deleteFromCloudinary };
