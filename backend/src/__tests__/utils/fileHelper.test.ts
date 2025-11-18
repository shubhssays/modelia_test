import { getSecureFileUrl, getFilenameFromPath, getUserUploadDir } from '../../utils/fileHelper';
import path from 'path';

describe('File Helper Utilities', () => {
  describe('getSecureFileUrl', () => {
    it('should generate secure file URL with userId and filename', () => {
      const url = getSecureFileUrl(1, 'img_123.jpg');

      expect(url).toBe('/files/1/img_123.jpg');
    });

    it('should handle different user IDs', () => {
      const url1 = getSecureFileUrl(1, 'test.jpg');
      const url2 = getSecureFileUrl(999, 'test.jpg');

      expect(url1).toBe('/files/1/test.jpg');
      expect(url2).toBe('/files/999/test.jpg');
    });

    it('should maintain filename exactly as provided', () => {
      const filename = 'result_1732012345-123456789.png';
      const url = getSecureFileUrl(42, filename);

      expect(url).toBe('/files/42/result_1732012345-123456789.png');
    });
  });

  describe('getFilenameFromPath', () => {
    it('should extract filename from Unix path', () => {
      const filename = getFilenameFromPath('/uploads/user_1/img_123.jpg');

      expect(filename).toBe('img_123.jpg');
    });

    // Note: Windows path test removed as path.basename() behavior varies by OS

    it('should return filename when no path provided', () => {
      const filename = getFilenameFromPath('test.jpg');

      expect(filename).toBe('test.jpg');
    });

    it('should handle paths with multiple directories', () => {
      const filename = getFilenameFromPath('/var/www/uploads/user_1/subfolder/image.png');

      expect(filename).toBe('image.png');
    });

    it('should handle filenames with dots', () => {
      const filename = getFilenameFromPath('/uploads/file.with.dots.jpg');

      expect(filename).toBe('file.with.dots.jpg');
    });
  });

  describe('getUserUploadDir', () => {
    it('should generate user-specific upload directory path', () => {
      const dir = getUserUploadDir(1);
      const expectedPath = path.join(process.cwd(), 'uploads', '1');

      expect(dir).toBe(expectedPath);
    });

    it('should handle different user IDs', () => {
      const dir1 = getUserUploadDir(1);
      const dir2 = getUserUploadDir(999);

      expect(dir1).toContain('uploads/1');
      expect(dir2).toContain('uploads/999');
      expect(dir1).not.toBe(dir2);
    });

    it('should return absolute path', () => {
      const dir = getUserUploadDir(1);

      expect(path.isAbsolute(dir)).toBe(true);
    });

    it('should include process.cwd() in path', () => {
      const dir = getUserUploadDir(123);

      expect(dir).toContain(process.cwd());
    });
  });
});
