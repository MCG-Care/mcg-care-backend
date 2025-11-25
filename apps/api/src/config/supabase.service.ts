import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Upload a file to Supabase Storage
   * @param bucket - The name of the storage bucket
   * @param path - The path where the file will be stored
   * @param file - The file buffer to upload
   * @param contentType - The MIME type of the file
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Delete a file from Supabase Storage
   * @param bucket - The name of the storage bucket
   * @param path - The path of the file to delete
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from Supabase Storage
   * @param bucket - The name of the storage bucket
   * @param paths - Array of file paths to delete
   */
  async deleteFiles(bucket: string, paths: string[]): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove(paths);

    if (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }

  /**
   * Extract the file path from a Supabase public URL
   * @param url - The public URL
   * @param bucket - The bucket name
   * @returns The file path
   */
  extractPathFromUrl(url: string, bucket: string): string {
    const bucketPath = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(bucketPath);
    if (index === -1) {
      throw new Error('Invalid Supabase URL');
    }
    return url.substring(index + bucketPath.length);
  }
}

