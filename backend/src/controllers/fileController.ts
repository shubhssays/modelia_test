import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { ForbiddenError, NotFoundError } from '../errors';
import { asyncHandler } from '../utils/asyncHandler';

export const fileController = {
  getFile: asyncHandler(async (req: Request, res: Response) => {
    const requesterId = req.user!.id!; // Set by auth middleware
    const { userId, filename } = req.params;

    // 1. Check permission - user can only access their own files
    if (requesterId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to access this file');
    }

    // 2. Build secure path and prevent directory traversal
    const uploadsBase = path.join(process.cwd(), 'uploads');
    const userFolder = path.join(uploadsBase, userId);
    const safeFilename = path.basename(filename); // Prevents ../../../etc/passwd
    const filePath = path.join(userFolder, safeFilename);

    // 3. Ensure file is within uploads directory (extra security)
    if (!filePath.startsWith(uploadsBase)) {
      throw new ForbiddenError('Invalid file path');
    }

    // 4. Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('File not found');
    }

    // 5. Stream the file
    res.sendFile(filePath);
  }),
};
