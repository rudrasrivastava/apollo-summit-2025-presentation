import { z } from "zod";
import * as fs from "fs";
import * as https from "https";
export function deployToVercelTool(server) {
    server.tool("deploy-to-vercel", "Deploy an HTML file to Vercel using the Vercel API. Requires VERCEL_TOKEN environment variable to be set.", {
        htmlFilePath: z.string().describe("Absolute path to the HTML file to deploy"),
        projectName: z.string().describe("Name for the Vercel project (will be used in the URL)"),
        vercelToken: z.string().optional().describe("Vercel API token (if not provided, will use VERCEL_TOKEN env var)"),
    }, async ({ htmlFilePath, projectName, vercelToken }) => {
        try {
            // Get Vercel token from parameter or environment
            const token = vercelToken || process.env.VERCEL_TOKEN;
            if (!token) {
                throw new Error("Vercel token is required. Set VERCEL_TOKEN environment variable or provide vercelToken parameter.");
            }
            // Validate HTML file exists
            if (!fs.existsSync(htmlFilePath)) {
                throw new Error(`HTML file not found at path: ${htmlFilePath}`);
            }
            // Read HTML file
            const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            // Prepare deployment payload
            const deploymentData = {
                name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                files: [
                    {
                        file: 'index.html',
                        data: htmlContent
                    }
                ],
                projectSettings: {
                    framework: null,
                    buildCommand: null,
                    outputDirectory: null
                },
                target: 'production'
            };
            // Make API request to Vercel
            const response = await makeVercelAPIRequest(token, deploymentData);
            if (response.error) {
                throw new Error(`Vercel API error: ${response.error.message}`);
            }
            const deploymentUrl = `https://${response.url}`;
            const inspectorUrl = `https://vercel.com/${response.creator?.username || 'user'}/${response.name}`;
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            deploymentId: response.uid,
                            url: deploymentUrl,
                            inspectorUrl: inspectorUrl,
                            projectName: response.name,
                            status: response.readyState,
                            createdAt: response.createdAt,
                            message: `✅ Successfully deployed to Vercel!\n🌐 Live URL: ${deploymentUrl}\n📊 Inspector: ${inspectorUrl}`
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : String(error),
                            message: `❌ Deployment failed: ${error instanceof Error ? error.message : String(error)}`
                        }, null, 2),
                    },
                ],
            };
        }
    });
}
async function makeVercelAPIRequest(token, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: 'api.vercel.com',
            port: 443,
            path: '/v13/deployments',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'mcp-vercel/1.0.0'
            }
        };
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedResponse = JSON.parse(responseData);
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        resolve(parsedResponse);
                    }
                    else {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsedResponse.error?.message || responseData}`));
                    }
                }
                catch (parseError) {
                    reject(new Error(`Failed to parse response: ${responseData}`));
                }
            });
        });
        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });
        req.write(postData);
        req.end();
    });
}
//# sourceMappingURL=deploy-to-vercel.js.map