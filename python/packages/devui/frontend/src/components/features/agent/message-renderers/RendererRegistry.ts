/**
 * Simplified Renderer Registry - Manages built-in message renderers only
 * (External plugin system removed - back to checkpoint)
 */

import type { MessageRenderer, RendererConfig, RenderersConfig } from "@/types/renderer";
import type { MessageContent } from "@/types/openai";

class RendererRegistry {
  private renderers: Map<string, MessageRenderer> = new Map();
  private config: RenderersConfig = {
    renderers: {},
    global: {
      theme: 'light',
      debug: false,
      fallback: 'openai-fallback'
    }
  };

  /**
   * Register a renderer
   */
  register(renderer: MessageRenderer): void {
    if (this.config.global.debug || true) {
      console.log(`[RendererRegistry] Registering renderer: ${renderer.id} (${renderer.name})`);
    }

    this.renderers.set(renderer.id, renderer);
    
    // Initialize default config if not present
    if (!this.config.renderers[renderer.id]) {
      this.config.renderers[renderer.id] = {
        enabled: true,
        config: {},
        priority: renderer.priority
      };
    }
  }

  /**
   * Unregister a renderer
   */
  unregister(rendererId: string): void {
    if (this.config.global.debug) {
      console.log(`[RendererRegistry] Unregistering renderer: ${rendererId}`);
    }

    this.renderers.delete(rendererId);
    delete this.config.renderers[rendererId];
  }

  /**
   * Get the best renderer for given content
   */
  getRenderer(content: MessageContent): MessageRenderer | null {
    const availableRenderers = Array.from(this.renderers.values())
      .filter(renderer => {
        const config = this.config.renderers[renderer.id];
        return config?.enabled !== false;
      })
      .sort((a, b) => b.priority - a.priority);

    // console log the available ones

    // Try to find a suitable renderer
    for (const renderer of availableRenderers) {
      try {
        if (this.config.global.debug || true) {
          console.log(`[RendererRegistry] Trying renderer: ${renderer.id} (${renderer.name})`);
        }

        if (renderer.canRender(content)) {
          if (this.config.global.debug || true) {
            console.log(`[RendererRegistry] Selected renderer: ${renderer.id} for content type: ${content.type}`);
          }
          return renderer;
        }
      } catch (error) {
        if (this.config.global.debug || true) {
          console.warn(`[RendererRegistry] Error checking renderer ${renderer.id}:`, error);
        }
      }
    }

    // Try fallback renderer if configured
    if (this.config.global.fallback) {
      const fallback = this.renderers.get(this.config.global.fallback);
      if (fallback) {
        if (this.config.global.debug) {
          console.log(`[RendererRegistry] Using fallback renderer: ${this.config.global.fallback}`);
        }
        return fallback;
      }
    }

    if (this.config.global.debug || true) {
      console.warn(`[RendererRegistry] No renderer found for content:`, content);
    }

    return null;
  }

  /**
   * Get all registered renderers
   */
  getAllRenderers(): MessageRenderer[] {
    return Array.from(this.renderers.values());
  }

  /**
   * Get renderer by ID
   */
  getById(rendererId: string): MessageRenderer | null {
    return this.renderers.get(rendererId) || null;
  }

  /**
   * Get current configuration
   */
  getConfig(): RenderersConfig {
    return { ...this.config };
  }

  /**
   * Update the entire configuration
   */
  updateConfig(newConfig: Partial<RenderersConfig>): void {
    if (newConfig.renderers) {
      this.config.renderers = { ...this.config.renderers, ...newConfig.renderers };
    }

    if (newConfig.global) {
      this.config.global = { ...this.config.global, ...newConfig.global };
    }

    if (this.config.global.debug) {
      console.log('[RendererRegistry] Configuration updated:', this.config);
    }
  }

  /**
   * Update renderer configuration
   */
  updateRendererConfig(rendererId: string, config: any): void {
    if (!this.config.renderers[rendererId]) {
      this.config.renderers[rendererId] = {
        enabled: true,
        config: {},
        priority: this.renderers.get(rendererId)?.priority || 0
      };
    }

    this.config.renderers[rendererId].config = {
      ...this.config.renderers[rendererId].config,
      ...config
    };

    if (this.config.global.debug) {
      console.log(`[RendererRegistry] Renderer ${rendererId} enabled`);
    }
  }

  /**
   * Enable/disable a renderer
   */
  setRendererEnabled(rendererId: string, enabled: boolean): void {
    if (!this.config.renderers[rendererId]) {
      this.config.renderers[rendererId] = {
        enabled,
        config: {},
        priority: this.renderers.get(rendererId)?.priority || 0
      };
    } else {
      this.config.renderers[rendererId].enabled = enabled;
    }

    if (this.config.global.debug) {
      console.log(`[RendererRegistry] Updated config for ${rendererId}:`, this.config.renderers[rendererId]);
    }
  }

  /**
   * Set global theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.config.global.theme = theme;
  }

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return this.config.global.theme;
  }

  /**
   * Enable/disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.config.global.debug = enabled;
  }

  /**
   * Clear all renderers
   */
  clear(): void {
    if (this.config.global.debug) {
      console.log('[RendererRegistry] Clearing all renderers');
    }
    this.renderers.clear();
    this.config.renderers = {};
  }
}

// Export singleton instance
export const rendererRegistry = new RendererRegistry();

// Debug access from browser console
if (typeof window !== 'undefined') {
  (window as any).rendererRegistry = rendererRegistry;
}