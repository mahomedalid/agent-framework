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
    /^\s*\|.*\|\s*$/m, // Single markdown table row
    /^\s*[^\n]*\|[^\n]*\|[^\n]*$/m, // Multiple pipe separators in a line
    /^\s*\w+\s*[,;]\s*\w+/m, // CSV-like pattern
    /visualization_type\s*:/i,
    /pivot.*table/i, // Pivot table pattern
    /cross.*tab/i, // Cross-tabulation pattern
    /Equipment.*Month/i, // Equipment/Month pattern from your data
    /\d{4}-\d{2}/g, // Date patterns like 2024-09
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

  // Helper function to convert string values to appropriate types
  const convertValue = (value: string): any => {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === '-') return null;
    
    // Try to parse as number
    if (/^\d+$/.test(trimmed) || /^\d+\.\d+$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      return isNaN(num) ? trimmed : num;
    }
    
    return trimmed;
  };

  // Extract tabular_data_json blocks
  const jsonBlockPattern = /```tabular_data_json\s*\n([\s\S]*?)\n```/gi;
  let match;
  
  while ((match = jsonBlockPattern.exec(text)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      if (jsonData.headers && jsonData.data) {
        tabularData.push(jsonData);
        cleanedContent = cleanedContent.replace(match[0], '');
      }
    } catch (error) {
      console.warn('Failed to parse tabular data JSON:', error);
    }
  }

  // Extract markdown tables
  const tablePattern = /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g;
  while ((match = tablePattern.exec(text)) !== null) {
    try {
      console.log('📋 Found markdown table match:', match[0]);
      const headers = match[1].split('|').map(h => h.trim()).filter(h => h);
      console.log('📝 Parsed headers:', headers);
      
      const rows = match[2].trim().split('\n');
      console.log('📄 Raw rows:', rows);
      
      const data = rows.map(row => {
        const values = row.split('|').map(v => v.trim()).filter(v => v);
        console.log('📊 Row values:', values);
        const rowData: Record<string, any> = {};
        headers.forEach((header, index) => {
          const originalValue = values[index] || '';
          const convertedValue = convertValue(originalValue);
          rowData[header] = convertedValue;
          console.log(`🔄 Converting "${originalValue}" -> ${convertedValue} (${typeof convertedValue})`);
        });
        return rowData;
      });
      
      console.log('📊 Final parsed data:', data);

      // Simple detection: if most columns after the first are numeric, it's probably pivot data
      const numericColumnCount = headers.slice(1).filter(header => {
        const hasNumeric = data.some(row => typeof row[header] === 'number');
        console.log(`📈 Column "${header}" has numeric data: ${hasNumeric}`);
        return hasNumeric;
      }).length;
      
      console.log(`🔢 Numeric columns count: ${numericColumnCount} out of ${headers.length - 1}`);
      const vizType = numericColumnCount >= 3 ? 'pivot' : 'table';
      console.log(`📊 Detected visualization type: ${vizType}`);

      const tableData = {
        headers,
        data,
        visualization_type: vizType
      };
      
      console.log('✅ Final table data object:', tableData);
      tabularData.push(tableData);
      
      cleanedContent = cleanedContent.replace(match[0], '');
    } catch (error) {
      console.warn('Failed to parse markdown table:', error);
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
  console.log('📄 TabularDataRenderer - Input text:', text);
  console.log('🔍 TabularDataRenderer - hasTabularData:', hasTabularData(text));
  
  const { content: cleanedContent, tabularData } = extractTabularData(text);
  console.log('📊 TabularDataRenderer - Extracted tabular data:', tabularData);
  console.log('🧹 TabularDataRenderer - Cleaned content:', cleanedContent);

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