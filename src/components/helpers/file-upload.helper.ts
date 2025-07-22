import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { ValidationException } from 'src/components/exceptions/user.exceptions';
import { Multer } from 'multer';

export class FileUploadHelper {
  static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate uploaded file
   */
  static validateFile(file: Multer.File): void {
    if (!file) {
      throw new ValidationException('No file provided');
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new ValidationException(
        `File type ${file.mimetype} not allowed. Only JPEG, PNG, WebP, and GIF are supported.`,
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new ValidationException(
        `File size ${file.size} exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes.`,
      );
    }
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    return `${timestamp}_${random}${extension}`;
  }

  /**
   * Ensure directory exists
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get image metadata using Sharp
   */
  static async getImageMetadata(file: Multer.File): Promise<any> {
    try {
      const metadata = await sharp(file.buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        density: metadata.density,
        channels: metadata.channels,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      throw new ValidationException('Unable to process image metadata');
    }
  }

  /**
   * Create thumbnail from image
   */
  static async createThumbnail(
    inputPath: string,
    outputPath: string,
    width: number = 200,
    height: number = 200,
  ): Promise<void> {
    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    } catch (error) {
      throw new ValidationException('Unable to create thumbnail');
    }
  }

  /**
   * Add watermark to image
   */
  static async addWatermark(
    inputPath: string,
    outputPath: string,
    watermarkPath: string,
  ): Promise<void> {
    try {
      await sharp(inputPath)
        .composite([
          {
            input: watermarkPath,
            gravity: 'southeast',
            blend: 'overlay',
          },
        ])
        .toFile(outputPath);
    } catch (error) {
      throw new ValidationException('Unable to add watermark');
    }
  }

  /**
   * Optimize image quality
   */
  static async optimizeImage(
    inputPath: string,
    outputPath: string,
    quality: number = 85,
  ): Promise<void> {
    try {
      const metadata = await sharp(inputPath).metadata();

      if (metadata.format === 'jpeg') {
        await sharp(inputPath)
          .jpeg({ quality, progressive: true })
          .toFile(outputPath);
      } else if (metadata.format === 'png') {
        await sharp(inputPath)
          .png({ quality, progressive: true })
          .toFile(outputPath);
      } else if (metadata.format === 'webp') {
        await sharp(inputPath).webp({ quality }).toFile(outputPath);
      } else {
        // For other formats, just copy the file
        fs.copyFileSync(inputPath, outputPath);
      }
    } catch (error) {
      throw new ValidationException('Unable to optimize image');
    }
  }

  /**
   * Delete file safely
   */
  static deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  /**
   * Get file extension from mimetype
   */
  static getExtensionFromMimetype(mimetype: string): string {
    const mimeExtensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    return mimeExtensions[mimetype] || '.jpg';
  }

  /**
   * Calculate file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get upload path based on patient ID and date
   */
  static getUploadPath(
    patientId: string,
    baseUploadPath: string = 'storage',
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return path.join(
      baseUploadPath,
      'patient-photos',
      year.toString(),
      month,
      patientId,
    );
  }

  /**
   * Save file buffer to disk
   */
  static async saveFile(
    buffer: Buffer,
    filePath: string,
    filename: string,
  ): Promise<string> {
    try {
      const fullPath = path.join(filePath, filename);
      await fs.promises.writeFile(fullPath, buffer);
      return fullPath;
    } catch (error) {
      throw new ValidationException('Unable to save file');
    }
  }
}
