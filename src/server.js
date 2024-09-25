const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Directory where labels will be saved
const labelsDir = path.join(__dirname, 'data', 'labels');

// Ensure the labels directory exists
if (!fs.existsSync(labelsDir)) {
    fs.mkdirSync(labelsDir, { recursive: true });
}

// Create the server
const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000'); // Allow requests from your client origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && pathname === '/save-label') {
        let body = '';

        // Collect the data from the request
        req.on('data', chunk => {
            body += chunk.toString(); // Convert binary data to string
        });

        // When the data is fully received
        req.on('end', () => {
            console.log('Received body:', body);  // Log the received body
            try {
                const jsonContent = JSON.parse(body);
                const { fileName, data } = jsonContent;

                if (!fileName || !data) {
                    res.statusCode = 400;
                    res.end('Missing file name or label data');
                    return;
                }

                // Path to save the JSON file
                const filePath = path.join(labelsDir, fileName);

                // Write the label data to a file
                fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
                    if (err) {
                        console.error('Error saving label:', err);
                        res.statusCode = 500;
                        res.end('Error saving label');
                        return;
                    }

                    console.log(`Label saved successfully as ${filePath}`);
                    res.statusCode = 200;
                    res.end('Label saved successfully');
                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

        req.on('error', (err) => {
            console.error('Request error:', err);
            res.statusCode = 400;
            res.end('Error receiving data');
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
