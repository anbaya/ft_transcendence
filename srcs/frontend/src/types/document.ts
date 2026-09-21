export interface Document {
  id: string;
  project_id?: string;
  uploader_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
}
