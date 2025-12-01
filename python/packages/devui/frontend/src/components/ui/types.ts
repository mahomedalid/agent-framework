/**
 * Types for UI Components
 */

export interface TabularData {
  title?: string;
  headers: string[];
  data: Array<Record<string, any>>;
  visualization_type?: string;
}