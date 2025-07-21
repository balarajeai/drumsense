
// import mqtt from "mqtt";

// const TOPICS = [
//   "factory/control",
//   "factory/filler",
//   "factory/conveyor",
//   "factory/collector"
// ];

// export function connectToMqtt(onMessage: (data: any) => void) {
//   const client = mqtt.connect("ws://localhost:9001");

//   client.on("connect", () => {
//     console.log("MQTT connected");
//     // Subscribe to all component topics
//     TOPICS.forEach(topic => {
//       client.subscribe(topic);
//       console.log(`Subscribed to ${topic}`);
//     });
//   });

//   client.on("message", (topic: string, message: Buffer) => {
//     try {
//       const data = JSON.parse(message.toString());
//       // Extract component type from topic
//       const componentType = topic.split('/')[1]; // e.g., "factory/control" -> "control"
//       onMessage({ ...data, componentType });
//     } catch (e) {
//       console.error("MQTT message error", e);
//     }
//   });
// }
