import asyncio
import websockets

async def chat_client():
    uri = "ws://localhost:8083"
    async with websockets.connect(uri) as websocket:
        # Set username
        username = input("Enter your username: ")
        await websocket.send(f'{{"type": "setUsername", "username": "{username}"}}')

        # Listen for messages
        async def receive_messages():
            while True:
                message = await websocket.recv()
                print(f"Received: {message}")

        # Send messages
        async def send_messages():
            while True:
                recipient = input("Enter recipient: ")
                message = input("Enter message: ")
                await websocket.send(f'{{"type": "chat", "recipient": "{recipient}", "message": "{message}"}}')

        await asyncio.gather(receive_messages(), send_messages())

asyncio.get_event_loop().run_until_complete(chat_client())