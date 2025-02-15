const WebSocket = require('ws');

// Buat WebSocket server pada port 8083
const wss = new WebSocket.Server({ port: 8083 });

// Objek untuk menyimpan koneksi klien beserta username-nya
const clients = new Map();

wss.on('listening', () => {
    console.log('WebSocket server is running on ws://localhost:8083');
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Minta klien untuk mengirim username
    ws.send(JSON.stringify({ type: 'requestUsername' }));

    // Event listener untuk menerima pesan dari klien
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Jika pesan berisi username, simpan ke Map
        if (data.type === 'setUsername') {
            const username = data.username;
            clients.set(ws, username);
            console.log(`User ${username} connected`);
            ws.send(JSON.stringify({ type: 'usernameSet', username }));
            return;
        }

        // Jika pesan berisi chat, kirim ke penerima
        if (data.type === 'chat') {
            const sender = clients.get(ws);
            const recipient = data.recipient;
            const messageContent = data.message;

            // Cari penerima berdasarkan username
            for (const [client, username] of clients.entries()) {
                if (username === recipient) {
                    client.send(JSON.stringify({
                        type: 'chat',
                        sender: sender,
                        message: messageContent,
                    }));
                    console.log(`Message from ${sender} to ${recipient}: ${messageContent}`);
                    break;
                }
            }
        }
    });

    // Event listener untuk menangani koneksi yang terputus
    ws.on('close', () => {
        const username = clients.get(ws);
        if (username) {
            console.log(`User ${username} disconnected`);
            clients.delete(ws);
        }
    });

    // Event listener untuk menangani error
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});