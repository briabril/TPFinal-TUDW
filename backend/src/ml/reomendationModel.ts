import brain from "brain.js";
import fs from "fs";
import path from "path";

const network = new brain.NeuralNetwork({ hiddenLayers: [6] });

const trainingData = [
  { input: { affinity: 0.1, popularity: 0.5, recency: 0.8 }, output: [0] },
  { input: { affinity: 0.9, popularity: 0.3, recency: 0.2 }, output: [1] },
  { input: { affinity: 0.4, popularity: 0.6, recency: 0.5 }, output: [0] },
];

network.train(trainingData, { iterations: 2000, log: true });

const modelDir = path.resolve("./ml/model");
fs.mkdirSync(modelDir, { recursive: true });
fs.writeFileSync(path.join(modelDir, "brain-model.json"), JSON.stringify(network.toJSON()));

console.log("✅ Modelo Brain.js entrenado y guardado");
