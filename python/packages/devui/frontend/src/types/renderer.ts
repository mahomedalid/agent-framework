/**
 * Renderer Type Definitions
 * 
 * Types for the message renderer system
 */

import type { MessageContent } from "./openai";
import type { ReactNode } from "react";

export interface RendererProps {
  className?: string;
  isStreaming?: boolean;
}

export interface MessageRenderer {
  id: string;
  name: string;
  version: string;
  priority: number;
  
  canRender(content: MessageContent): boolean;
  render(content: MessageContent, props: RendererProps): ReactNode;
}

export interface RendererConfig {
  enabled: boolean;
  config: Record<string, any>;
  priority?: number;
  source?: 'local' | 'npm' | 'remote';
  path?: string;
  package?: string;
  url?: string;
  exports?: string[];
}

export interface RenderersConfig {
  renderers: Record<string, RendererConfig>;
  global: {
    theme: 'light' | 'dark';
    debug: boolean;
    fallback?: string;
  };
}