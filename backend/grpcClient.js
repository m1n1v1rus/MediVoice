const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "protos", "ai.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const aiProto = grpc.loadPackageDefinition(packageDefinition).ai;

const client = new aiProto.AIService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Function to handle a WebSocket connection via gRPC
function handleAudioStream(ws) {
  // Open the gRPC stream
  const call = client.StreamAudio();

  // Listen to incoming WebSocket messages (audio chunks from React)
  ws.on("message", (message) => {
    // React sends JSON strings over WebSocket
    const msgStr = Buffer.isBuffer(message) ? message.toString() : message;
    call.write({ metadata: msgStr });
  });

  // Listen to response chunks from Python gRPC server
  call.on("data", (response) => {
    if (response.metadata && ws.readyState === 1) { // 1 = OPEN
      ws.send(response.metadata);
    }
  });

  call.on("end", () => {
    console.log("[gRPC] Stream ended by Python server.");
    if (ws.readyState === ws.OPEN) ws.close();
  });

  call.on("error", (error) => {
    console.error("[gRPC] Streaming error:", error);
    if (ws.readyState === ws.OPEN) ws.close();
  });

  // Handle WS close
  ws.on("close", () => {
    console.log("[WS] Client disconnected. Closing gRPC stream.");
    call.end(); // close stream to Python
  });
}

module.exports = {
  client,
  handleAudioStream,
};
