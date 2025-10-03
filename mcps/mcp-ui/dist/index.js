#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { createUIResource } from '@mcp-ui/server';
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
                    mimeType: 'application/vnd.mcp-ui+json',
                    name: resource.name || 'Embedded Site',
                    description: `Embedded site: ${resource.content.iframeUrl}`,
                })),
            };
        });
        // Read resource content
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            const resource = this.resources.get(uri);
            if (resource) {
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/vnd.mcp-ui+json',
                            text: JSON.stringify(resource),
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
                        description: 'Embed an external website in an iframe. DO NOT CALL THIS WITH OTHER TOOLS',
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
                const uri = `ui://apollo-embeddable-ui/site-${Date.now()}`;
                // GooseConfig for sidecar display
                const gooseConfig = {
                    type: "sidecar",
                    width: "50%",
                };
                return {
                    content: [
                        createUIResource({
                            uri,
                            content: {
                                type: "externalUrl",
                                iframeUrl: url,
                            },
                            encoding: "text",
                            resourceProps: {
                                annotations: {
                                    gooseConfig,
                                    audience: ["user"],
                                },
                            },
                        }),
                        {
                            type: "text",
                            text: `Embedded ${siteName}: ${url}`,
                            annotations: {
                                audience: ["assistant"],
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
        console.error('Apollo Embeddable UI MCP Server running on stdio');
    }
}
const server = new EmbeddableUIServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map