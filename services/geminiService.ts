import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const enhanceText = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  try {
    // FIX: Updated generateContent call to align with Gemini API guidelines.
    // The model name has been updated to 'gemini-2.5-flash', `contents` is now a simple string,
    // and `systemInstruction` is correctly placed within a `config` object.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "Você é um especialista em RH que cria currículos. Sua tarefa é reescrever o texto fornecido para ser mais profissional e impactante. Responda apenas com o texto reescrito, sem introduções ou comentários."
        },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate text enhancement.");
  }
};

export const suggestSkills = async (jobTitle: string, experience: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  if (!jobTitle.trim()) {
    return [];
  }

  try {
    const prompt = `Com base no cargo de "${jobTitle}" e na seguinte descrição de experiência profissional: "${experience}", sugira uma lista de 8 habilidades e competências relevantes (incluindo técnicas e comportamentais). Retorne apenas a lista de habilidades, separadas por vírgula. Exemplo: Liderança, Comunicação, React, Gestão de Projetos, Proatividade, Git, Scrum, Trabalho em Equipe`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "Você é um especialista em RH que ajuda a montar currículos. Sua tarefa é sugerir habilidades com base nas informações fornecidas. Responda apenas com a lista de habilidades separadas por vírgula, sem introduções ou comentários."
        },
    });

    const skillsText = response.text.trim();
    if (!skillsText) return [];

    return skillsText.split(',').map(skill => skill.trim()).filter(Boolean);
  } catch (error) {
    console.error("Error calling Gemini API for skill suggestion:", error);
    throw new Error("Failed to generate skill suggestions.");
  }
};
