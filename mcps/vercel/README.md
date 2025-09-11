# MCP Vercel

A minimal Model Context Protocol (MCP) server that provides a tool for deploying HTML files to Vercel.

## Features

- Deploy HTML files directly to Vercel
- Uses Vercel's API for deployment
- Returns deployment URL and inspector link

## Installation

```bash
npm install
npm run build
```

## Usage

### Environment Setup

Set your Vercel token as an environment variable:

```bash
export VERCEL_TOKEN=your_vercel_token_here
```

### Running the MCP Server

```bash
npm start
# or
node dist/index.js
```

### Available Tools

#### deploy-to-vercel

Deploy an HTML file to Vercel.

**Parameters:**
- `htmlFilePath` (string): Absolute path to the HTML file to deploy
- `projectName` (string): Name for the Vercel project (will be used in the URL)
- `vercelToken` (string, optional): Vercel API token (if not provided, will use VERCEL_TOKEN env var)

**Returns:**
- Deployment URL
- Inspector URL
- Deployment ID and status
- Success/error message

## Configuration

The server uses the Model Context Protocol (MCP) for communication. Make sure your MCP client is configured to connect to this server via stdio transport.
