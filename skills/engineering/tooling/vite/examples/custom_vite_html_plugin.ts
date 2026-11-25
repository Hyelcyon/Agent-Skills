interface HtmlPluginOptions {
  appTitle: string;
  injectAnalytics: boolean;
  analyticsId?: string;
}

interface VitePlugin {
  name: string;
  transformIndexHtml: (html: string) => string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createHtmlTransformPlugin(options: HtmlPluginOptions): VitePlugin {
  return {
    name: 'custom-html-transform-plugin',
    transformIndexHtml(html: string): string {
      const safeTitle = escapeHtml(options.appTitle);
      let transformed = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);

      if (options.injectAnalytics && options.analyticsId) {
        const safeSiteId = escapeHtml(options.analyticsId);
        const scriptTag = `<script async src="https://analytics.example.com/tracker.js" data-site-id="${safeSiteId}"></script>`;
        transformed = transformed.replace('</head>', `${scriptTag}\n</head>`);
      }

      return transformed;
    }
  };
}

export { createHtmlTransformPlugin };
export type { HtmlPluginOptions, VitePlugin };
