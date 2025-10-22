import * as brain from "brain.js";
import fs from "fs";
import path from "path";

let network: brain.NeuralNetwork<any, any> | null = null;

export function loadModel() {
  const modelPath = path.resolve("./src/ml/model/brain-model.json");

  if (fs.existsSync(modelPath)) {
    const json = fs.readFileSync(modelPath, "utf8");
    network = new brain.NeuralNetwork().fromJSON(JSON.parse(json));
    console.log("✅ Modelo Brain.js cargado correctamente");
  } else {
    network = new brain.NeuralNetwork({ hiddenLayers: [6] });
    console.log("⚠️ Modelo nuevo creado (no entrenado)");
  }
  return network!;
}

export function predictInteraction(features: number[]): number {
  if (!network) loadModel();

  const [affinity, popularity, recency] = features;
  const output = network!.run({ affinity, popularity, recency }) as number[];
  return output[0];
}
