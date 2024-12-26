  // import multer from 'multer';
  // import { CloudinaryStorage } from 'multer-storage-cloudinary';
  // import cloudinary from '../config/cloudinary.js'; 

  // // Cloudinary storage setup with type assertion for `resource_type`
  // const storage = new CloudinaryStorage({
  //   cloudinary: cloudinary,
  //   params: {
  //     folder: 'user_profiles',
  //     allowed_formats: ['jpg', 'png', 'jpeg'],
  //     transformation: [{ width: 500, height: 500, crop: 'limit' }],
  //     // Cast the params to `any` to bypass the type-checking issue
  //   } as any // Explicitly casting this object to `any` to bypass TS check
  // });

  // // Multer instance to handle file uploads
  // export const upload = multer({ storage: storage });

  
    import multer from 'multer';
  import { CloudinaryStorage } from 'multer-storage-cloudinary';
  import cloudinary from '../config/cloudinary.js'; 

  // Cloudinary storage setup
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'user_profiles', // Cloudinary folder name
      allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    }as any,
  });

  // Create a multer instance with storage settings
  export const upload = multer({ storage: storage });

// // Middleware for handling multiple file uploads
// export const uploadFiles = upload.fields([
//   { name: 'licenses', maxCount: 1 }, // Adjust maxCount as needed
//   { name: 'certificates', maxCount: 10 } // Adjust maxCount as needed
// ]);

  