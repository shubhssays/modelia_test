import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsBaseDir = path.join(process.cwd(), 'uploads');

// Create base uploads directory if it doesn't exist
if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Get userId from authenticated request
    const userId = (req as any).user.id;
    
    if (!userId) {
      return cb(new Error('User not authenticated'), '');
    }

    // Create user-specific folder
    const userUploadDir = path.join(uploadsBaseDir, userId.toString());
    
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }
    
    cb(null, userUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});
