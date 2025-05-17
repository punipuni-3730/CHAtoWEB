const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const chatFile = path.resolve(process.cwd(), 'CHAtoWEB/Chat.json');
const maxMessages = 50;

const server = http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        let messages = [];
        let errorMessage = '';

        try {
            await fs.access(chatFile);
            const data = await fs.readFile(chatFile, 'utf8');
            const lines = data.split('\n').filter(line => line.trim());
            messages = lines
                .slice(-maxMessages)
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(msg => msg)
                .reverse();
        } catch (err) {
            console.error('Error reading chat file:', err);
            errorMessage = `Could not read chat file at ${chatFile}. Ensure the Minecraft server is running and the ChatLogger plugin is active.`;
        }

        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="5">
    <title>Minecraft Chat Viewer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        .error {
            color: red;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>Minecraft Chat Viewer</h1>
    ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ''}
    <table>
        <tr>
            <th>Timestamp</th>
            <th>Player</th>
            <th>Message</th>
        </tr>
        ${messages.map(msg => `
            <tr>
                <td>${escapeHtml(msg.timestamp)}</td>
                <td>${escapeHtml(msg.player)}</td>
                <td>${escapeHtml(msg.message)}</td>
            </tr>
        `).join('')}
    </table>
</body>
</html>
`;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

function escapeHtml(str) {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, match => entities[match]);
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`サーバー運転中: http://localhost:${PORT}/`);
    console.log(`読み取り中のファイル: ${chatFile}`);
});