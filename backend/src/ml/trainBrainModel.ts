import * as brain from "brain.js";
import fs from "fs";
import path from "path";

console.log("🚀 trainBrainModel iniciado"); // log inicial

// Crear la red
const network = new brain.NeuralNetwork({ hiddenLayers: [6] });

// Datos de entrenamiento
const trainingData = [
  { input: { affinity: 0.1, popularity: 0.5, recency: 0.8 }, output: [0] },
  { input: { affinity: 0.9, popularity: 0.3, recency: 0.2 }, output: [1] },
  { input: { affinity: 0.4, popularity: 0.6, recency: 0.5 }, output: [0] },
];

// Entrenar con logs
console.log("⚡ Entrenando modelo...");
network.train(trainingData, { iterations: 2000, log: (stats) => console.log(stats), logPeriod: 100 });

// Guardar modelo
const modelDir = path.resolve("./src/ml/model");
fs.mkdirSync(modelDir, { recursive: true });

const modelPath = path.join(modelDir, "brain-model.json");
fs.writeFileSync(modelPath, JSON.stringify(network.toJSON(), null, 2));

console.log(`✅ Modelo entrenado y guardado en: ${modelPath}`);
