/**
 * PDF Workspace Tool Types and Categories
 */

export type ToolId =
  | 'pdf_maker'
  | 'pdf_to_word'
  | 'word_to_pdf'
  | 'merge_pdf'
  | 'split_pdf'
  | 'compress_pdf'
  | 'edit_pdf'
  | 'pdf_to_images'
  | 'images_to_pdf'
  | 'rotate_pdf'
  | 'organize_pages'
  | 'protect_pdf';

export type ToolCategory = 'all' | 'create_edit' | 'convert' | 'organize' | 'security';

export interface ToolItem {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  accent: 'amber' | 'cyan' | 'blue' | 'emerald' | 'violet';
  tag: string;
  badge?: string;
  inputFormat: string;
  outputFormat: string;
}
