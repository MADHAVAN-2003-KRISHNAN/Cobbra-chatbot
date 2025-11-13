
declare const window: any;

export const askQuestion = async (context: string, question: string): Promise<string> => {
    if (!window.GoogleGenAI) {
        throw new Error("Gemini API script not loaded yet.");
    }
    
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }

    const { GoogleGenAI } = window;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = "You are an expert Q&A system. Your task is to answer questions based ONLY on the provided context from uploaded documents. If the answer is not found in the context, clearly state that the information is not available in the provided documents. Do not use any external knowledge or make assumptions.";

    const prompt = `CONTEXT:\n${context}\n\nQUESTION:\n${question}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2, // Lower temperature for more factual, less creative answers
            }
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a response from the AI model.");
    }
};
