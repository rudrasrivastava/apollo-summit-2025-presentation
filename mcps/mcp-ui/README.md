# Apollo Embeddable UI MCP Server

A simple MCP-UI server that allows embedding external websites in iframe containers using the official [mcp-ui](https://github.com/idosal/mcp-ui) packages (`@mcp-ui/server`).

## Features

- Embed any external website in a secure iframe
- Dynamic URL embedding via tool calls
- No hardcoded URLs - all sites provided as parameters

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

3. Test the server (optional):
```bash
npm start
```

## Using with Goose

### Option 1: Direct Configuration in Goose Config

Add this to your Goose configuration file (usually `~/.config/goose/profiles.yaml`):

```yaml
default:
  provider: your-provider
  processor: your-processor
  mcp:
    servers:
      apollo-embeddable-ui:
        command: node
        args: ["dist/index.js"]
        cwd: "/Users/rudra/Development/apollo-summit-2025-presentation/mcps/mcp-ui"
```

### Option 2: Using MCP Config File

Use the provided `mcp-config.json`:

```bash
goose session start --mcp-config mcp-config.json
```

### Option 3: Environment Variable

Set the MCP servers via environment variable:
```bash
export MCP_SERVERS='{"apollo-embeddable-ui":{"command":"node","args":["dist/index.js"],"cwd":"/Users/rudra/Development/apollo-summit-2025-presentation/mcps/mcp-ui"}}'
goose session start
```

## Usage

### Using the Tool in Goose

Once connected, you can ask Goose to embed any website:

```
"Please embed the site https://example.com"
```

Or more specifically:
```
"Use the embed_site tool to show me https://github.com/idosal/mcp-ui with the name 'MCP-UI Repository'"
```

The tool accepts these parameters:
- `url` (required): The website URL to embed
- `name` (optional): Display name for the embedded site

### Dynamic Embedding

All websites are embedded dynamically through tool calls. There are no pre-configured or hardcoded URLs - you provide the URL each time you want to embed a site.

## Supported MCP-UI Hosts

This server works with any MCP-UI compatible host including:
- [Goose](https://block.github.io/goose/)
- [LibreChat](https://www.librechat.ai/)
- [Postman](https://www.postman.com/)
- [Smithery](https://smithery.ai/playground)
- And more!

## Security

All embedded content runs in a sandboxed iframe for security, as provided by the mcp-ui framework.
