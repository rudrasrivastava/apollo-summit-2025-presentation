#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
class EmbeddableUIServer {
    server;
    resources = new Map();
    constructor() {
        this.server = new Server({
            name: 'apollo-embeddable-ui',
            version: '1.0.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: Array.from(this.resources.entries()).map(([uri, resource]) => ({
                    uri,
                    mimeType: 'text/html',
                    name: resource.name || 'Embedded Site',
                    description: `Embedded site: ${resource.url}`,
                })),
            };
        });
        // Read resource content
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            const resource = this.resources.get(uri);
            if (resource) {
                // Return as HTML iframe
                const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${resource.name}</title>
    <style>
        body { margin: 0; padding: 0; }
        iframe { width: 100%; height: 100vh; border: none; }
    </style>
</head>
<body>
    <iframe src="${resource.url}" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
</body>
</html>`;
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'text/html',
                            text: html,
                        },
                    ],
                };
            }
            throw new Error(`Resource not found: ${uri}`);
        });
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'embed_site',
                        description: 'Embed an external website in an iframe',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    description: 'The URL of the site to embed',
                                },
                                name: {
                                    type: 'string',
                                    description: 'Display name for the embedded site',
                                    default: 'Embedded Site',
                                },
                            },
                            required: ['url'],
                        },
                    },
                ],
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            if (name === 'embed_site') {
                const { url, name: siteName = 'Embedded Site' } = args;
                const uri = `ui://embedded-site/${Date.now()}`;
                // Store the resource info
                this.resources.set(uri, { url, name: siteName });
                // Create HTML directly in the response
                const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${siteName}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .container { padding: 20px; }
        iframe { width: 100%; height: 600px; border: 1px solid #ccc; border-radius: 8px; }
        .header { margin-bottom: 10px; color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h3 class="header">Embedded Site: ${siteName}</h3>
        <iframe src="${url}" 
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                title="${siteName}">
        </iframe>
        <p><small>Source: <a href="${url}" target="_blank">${url}</a></small></p>
    </div>
</body>
</html>`;
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Here's the embedded site for: ${url}`,
                        },
                        {
                            type: 'resource',
                            resource: {
                                uri,
                                mimeType: 'text/html',
                                text: html,
                            },
                        },
                    ],
                };
            }
            throw new Error(`Tool not found: ${name}`);
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Apollo Embeddable UI MCP Server (Alternative) running on stdio');
    }
}
const server = new EmbeddableUIServer();
server.run().catch(console.error);
//# sourceMappingURL=alternative-index.js.map