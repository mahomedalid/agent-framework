/**
 * Tabular Data Message Renderer
 * 
 * Internal renderer for messages containing tabular data
 * Integrated directly into DevUI without external plugin system
 */

import React from 'react';
import type { MessageRenderer, RendererProps } from '@/types/renderer';
import type { MessageContent } from '@/types/openai';
import { TabularDataVisualization } from '@/components/ui/tabular-data-visualization';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

// Utility functions for tabular data extraction
function hasTabularData(text: string): boolean {
  // Look for patterns that suggest tabular data
  const patterns = [
    /```tabular_data_json/i,
    /\|.*\|.*\|/, // Markdown table pattern
    /^\s*\w+\s*[,;]\s*\w+/m, // CSV-like pattern
    /visualization_type\s*:/i
  ];

  return patterns.some(pattern => pattern.test(text));
}

interface TabularData {
  title?: string;
  headers: string[];
  data: Array<Record<string, any>>;
  visualization_type?: string;
}

function extractTabularData(text: string): { content: string; tabularData: TabularData[] } {
  const tabularData: TabularData[] = [];
  let cleanedContent = text;

  // Extract tabular_data_json blocks
  const jsonBlockPattern = /```tabular_data_json\s*\n([\s\S]*?)\n```/gi;
  let match;
  
  while ((match = jsonBlockPattern.exec(text)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      if (jsonData.headers && jsonData.data) {
        tabularData.push(jsonData);
        // Remove the JSON block from content
        cleanedContent = cleanedContent.replace(match[0], '');
      }
    } catch (error) {
      console.warn('Failed to parse tabular data JSON:', error);
    }
  }

  // Extract markdown tables if no JSON data found
  if (tabularData.length === 0) {
    const tablePattern = /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g;
    while ((match = tablePattern.exec(text)) !== null) {
      try {
        const headers = match[1].split('|').map(h => h.trim()).filter(h => h);
        const rows = match[2].trim().split('\n');
        const data = rows.map(row => {
          const values = row.split('|').map(v => v.trim()).filter(v => v);
          const rowData: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });
          return rowData;
        });

        tabularData.push({
          headers,
          data,
          visualization_type: 'table'
        });
        
        // Remove the table from content
        cleanedContent = cleanedContent.replace(match[0], '');
      } catch (error) {
        console.warn('Failed to parse markdown table:', error);
      }
    }
  }

  return { content: cleanedContent.trim(), tabularData };
}

/**
 * Tabular Data Renderer Component
 */
function TabularDataRendererComponent({ 
  content, 
  className, 
  isStreaming 
}: RendererProps & { content: MessageContent }) {
  if (content.type !== 'text') return null;

  const text = content.text || '';
  const { content: cleanedContent, tabularData } = extractTabularData(text);

  return (
    <div className={`break-words ${className || ""}`}>
      {/* Render regular text content */}
      {cleanedContent.trim() && (
        <MarkdownRenderer content={cleanedContent} />
      )}

      {/* Render tabular data */}
      {tabularData.map((data, index) => (
        <TabularDataVisualization
          key={index}
          data={data}
          className="my-4"
        />
      ))}

      {/* Streaming indicator */}
      {isStreaming && text.length > 0 && (
        <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
      )}
    </div>
  );
}

/**
 * Tabular Data Message Renderer
 * 
 * Handles text content that contains tabular data and visualizes it
 */
export const TabularDataRenderer: MessageRenderer = {
  id: 'tabular-data',
  name: 'Tabular Data Renderer',
  version: '1.0.0',
  priority: 75, // Higher than default text renderer (50) but lower than specialized renderers

  canRender(content: MessageContent): boolean {
    return (
      content.type === 'text' && 
      typeof content.text === 'string' && 
      hasTabularData(content.text)
    );
  },

  render(content: MessageContent, props: RendererProps): React.ReactNode {
    return (
      <TabularDataRendererComponent
        content={content}
        {...props}
      />
    );
  }
};

export default TabularDataRenderer;