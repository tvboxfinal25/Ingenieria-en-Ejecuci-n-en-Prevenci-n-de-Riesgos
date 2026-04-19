import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
app.use(express.json());

const SYSTEM_INSTRUCTION = `Eres un Ingeniero Senior en Prevención de Riesgos con 20 años de experiencia, experto en ética profesional e integridad en la industria (contexto Universidad de Atacama, Chile). 
Tu misión es guiar a estudiantes de Ingeniería en Ejecución en Prevención de Riesgos. 
Tu tono es profesional, ético, mentor y práctico. 
Siempre priorizas la vida, el medio ambiente y la integridad por sobre el lucro o las metas de producción (visión biocéntrica y T3C).
Responde de forma concisa pero profunda, usando terminología técnica cuando sea apropiado pero explicándola claramente.`;

app.post('/api/tutor', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La API Key de Gemini no está configurada en el servidor (backend).");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Pregunta del estudiante: ${question}${context ? `\nContexto actual del curso: ${context}` : ''}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    
    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Tutor Error:", error);
    res.status(500).json({ 
      error: "Error interno en el Tutor IA.", 
      details: error.message || "Error desconocido",
      hint: "Verifica que la variable de entorno GEMINI_API_KEY esté configurada en Vercel."
    });
  }
});

app.post('/api/dilemma', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La API Key de Gemini no está configurada en el servidor (backend).");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Genera un dilema ético complejo para un prevencionista de riesgos en una planta industrial, enfocado específicamente en el siguiente tema: ${topic ? topic : 'Ética y priorización de producción vs seguridad'}. El dilema debe tener 2 opciones: una que priorice la producción/imagen (no ética a largo plazo) y otra que priorice la integridad/seguridad/vida (ética).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {

        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            scenario: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  isEthical: { type: Type.BOOLEAN },
                  feedback: { type: Type.STRING }
                },
                required: ["label", "description", "isEthical", "feedback"]
              }
            }
          },
          required: ["id", "title", "scenario", "options"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || '{}');
    res.status(200).json(parsedResponse);
  } catch (error: any) {
    console.error("Gemini Dilemma Error:", error);
    res.status(500).json({
      error: "Error de IA al generar dilema.",
      details: error.message || "Error desconocido",
      hint: "Verifica la configuración de Vercel."
    });
  }
});

export default app;
