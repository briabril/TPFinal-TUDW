import axios from "axios";
const HF_TOKEN = process.env.HF_TOKEN;


 const MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/joeddav/xlm-roberta-large-xnli";


export const classifyPostText = async (text: string) => {
    try{ 
        const candidate_labels =[
            "deportes",
            "tecnología",
            "política",
            "música",
            "moda",
            "arte",
            "viajes",
            "juegos",
            "gaming",
            "programación",
            "educación",
            "salud",
            "comida"
        ]
        const response  = await axios.post(MODEL_URL, {  inputs: text,
        parameters: {
          candidate_labels,
          multi_label: true,
        },
    }, {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
         timeout: 15000,
      })
      const data = response.data
     const labels = data?.labels || data?.[0]?.labels || [];
    const scores = data?.scores || data?.[0]?.scores || [];

      const filteredTopics = labels
      .map((label: string, i: number) => ({
        label,
        score: scores[i],
      }))
      .filter((t) => t.score > 0.4)
      .sort((a, b) => b.score - a.score);

    return filteredTopics;
    }catch(error: any){
         console.error("Error al clasificar el texto:", error?.response?.data || error);
    return { topic: "unknown", confidence: 0 };
    }
}
