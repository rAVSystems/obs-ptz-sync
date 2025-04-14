import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { PtzController } from "./actions/controller-mode-select";
import WebSocket from 'ws';

async function connectToOBSWebSocket() {
    /*
    const obsWebSocketUrl = 'ws://localhost:4455';
    const ws = new WebSocket(obsWebSocketUrl);

    ws.on('open', async function open() {
        streamDeck.logger.trace('Connected to OBS WebSocket');
    });

    ws.on('message', function incoming(data) {
        try {
            const messageString = data.toString();
            const messageJson = JSON.parse(messageString);
    
            streamDeck.logger.trace("Received:", messageJson);
            if (messageJson.op === 0) {
                const rpcVersion = messageJson.d.rpcVersion;

                const identifyMessage = {
                    op: 1,
                    d: {
                        rpcVersion: rpcVersion,
                    },
                };
    
                ws.send(JSON.stringify(identifyMessage));
                streamDeck.logger.trace("Sent Identify message:", identifyMessage);
            }
    
        } catch (error) {
            streamDeck.logger.error("Failed to parse message as JSON:", error);
        }
    });

    ws.on('error', function error(err) {
        streamDeck.logger.error('WebSocket error: ' + err.message);
    });

    ws.on('close', function close() {
        streamDeck.logger.trace('Disconnected from OBS WebSocket');
    });

    return ws;
    */
}



streamDeck.logger.setLevel(LogLevel.TRACE);
streamDeck.actions.registerAction(new PtzController());
streamDeck.connect().then(() => {
    //connectToOBSWebSocket();
});
