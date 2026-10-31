export interface Document {
  id: number;
  project_id: number;
  project_name?: string;
  uploaded_by_id?: number;
  uploaded_by_name?: string;
  name: string;
  file: string;
  uploaded_at: string;
  // Fallbacks for compatibility
  filename?: string;
  file_size?: number;
  file_type?: string;
}
