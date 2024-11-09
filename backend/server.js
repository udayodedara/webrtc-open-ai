import OpenAI from "openai";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config(); // Initialize dotenv to load environment variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const result = message?.toString();
    console.log("Received message:", result);

    // Use OpenAI API to get a response based on the incoming message
    const response = await getOpenAIResponse(result);
    // console.log("response", response);

    // Send the response back to the client
    ws.send(response);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

async function getOpenAIResponse(prompt) {
  try {
    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: prompt }],
    // });
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    console.log("response", response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "Error processing request.";
  }
}

console.log("WebSocket server started on ws://localhost:8080");
