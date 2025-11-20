/**
 * Message Renderer - Exports
 * Internal renderers only (back to checkpoint - no external plugin system)
 */

export { OpenAIContentRenderer } from './OpenAIContentRenderer';
export { OpenAIMessageRenderer } from './OpenAIMessageRenderer';

// Core renderer system (simplified)
export { rendererRegistry } from './RendererRegistry';
export { TabularDataRenderer } from './TabularDataRenderer';

// Register built-in renderers
import { rendererRegistry } from './RendererRegistry';
import { TabularDataRenderer } from './TabularDataRenderer';

// Register the tabular data renderer
rendererRegistry.register(TabularDataRenderer);

// Enable debug logging in development
if (import.meta.env.DEV) {
  rendererRegistry.setDebug(true);
}