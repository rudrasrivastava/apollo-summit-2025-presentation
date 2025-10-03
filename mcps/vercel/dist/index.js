#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { deployToVercelTool } from "./tools/index.js";
// Create and configure the MCP server
const server = new McpServer({
    name: "mcp-vercel",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Register the deploy-to-vercel tool
deployToVercelTool(server);
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map