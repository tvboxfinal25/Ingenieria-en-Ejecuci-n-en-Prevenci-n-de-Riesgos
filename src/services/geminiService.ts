import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `Eres un Ingeniero Senior en Prevención de Riesgos con 20 años de experiencia, experto en ética profesional e integridad en la industria (contexto Universidad de Atacama, Chile). 
Tu misión es guiar a estudiantes de Ingeniería en Ejecución en Prevención de Riesgos. 
Tu tono es profesional, ético, mentor y práctico. 
Siempre priorizas la vida, el medio ambiente y la integridad por sobre el lucro o las metas de producción (visión biocéntrica y T3C).
Responde de forma concisa pero profunda, usando terminología técnica cuando sea apropiado pero explicándola claramente.`;

export interface AIDilemma {
  id: string;
  title: string;
  scenario: string;
  options: {
    label: string;
    description: string;
    isEthical: boolean;
    feedback: string;
  }[];
}

export async function askEthicalExpert(question: string, context?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Pregunta del estudiante: ${question}${context ? `\nContexto actual del curso: ${context}` : ''}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, colega. En este momento tengo problemas de conexión con la central. Intenta consultarme en unos minutos.";
  }
}

export async function generateDynamicDilemma(): Promise<AIDilemma> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Genera un dilema ético complejo para un prevencionista de riesgos en una planta industrial. El dilema debe tener 2 opciones: una que priorice la producción/imagen y otra que priorice la integridad/seguridad.",
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

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Dilemma Error:", error);
    // Fallback dilemma
    return {
      id: "fallback",
      title: "Error en Estructura de Planta",
      scenario: "Has descubierto una fisura en una viga crítica a 48 horas de la inauguración oficial con autoridades nacionales.",
      options: [
        { label: "Reportar Inmediatamente", description: "Detener la inauguración y realizar pruebas de carga.", isEthical: true, feedback: "Excelente decisión. La integridad estructural no se transa por actos políticos." },
        { label: "Proceder con Inauguración", description: "Monitorear visualmente y reparar después del evento.", isEthical: false, feedback: "Riesgo inaceptable. Una falla estructural durante el evento sería catastrófica." }
      ]
    };
  }
}
