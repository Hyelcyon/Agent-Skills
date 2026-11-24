interface HtmlPluginOptions {
  appTitle: string;
  injectAnalytics: boolean;
  analyticsId?: string;
}

interface VitePlugin {
  name: string;
  transformIndexHtml: (html: string) => string;
}

function createHtmlTransformPlugin(options: HtmlPluginOptions): VitePlugin {
  return {
    name: 'custom-html-transform-plugin',
    transformIndexHtml(html: string): string {
      let transformed = html.replace(/<title>(.*?)<\/title>/, `<title>${options.appTitle}</title>`);

      if (options.injectAnalytics && options.analyticsId) {
        const scriptTag = `<script async src="https://analytics.example.com/tracker.js" data-site-id="${options.analyticsId}"></script>`;
        transformed = transformed.replace('</head>', `${scriptTag}\n</head>`);
      }

      return transformed;
    }
  };
}

export { createHtmlTransformPlugin };
export type { HtmlPluginOptions, VitePlugin };
