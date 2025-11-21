import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { StyleMetrics, StudentSample, TransformationSettings, ProcessingResult } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model for analysis and generation
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Analyzes a collection of student samples to extract a "Style DNA"
 */
export const analyzeStudentStyle = async (samples: StudentSample[]): Promise<StyleMetrics> => {
  if (samples.length === 0) {
    throw new Error("No samples provided for analysis.");
  }

  const combinedText = samples.map(s => `[Type: ${s.tag}] ${s.text}`).join("\n---\n");

  const prompt = `
    Analyze the following text samples written by a student. 
    Your goal is to extract a stylistic profile so we can mimic this person later.
    Focus on:
    1. Vocabulary complexity (1-10, where 1 is elementary, 10 is academic PhD).
    2. Sentence structure and length variance.
    3. Grammar correctness (Are there run-on sentences? Comma splices? Or perfect grammar?).
    4. Typical connector words they use (e.g., "otzhe", "koroche", "po suti", or formal ones).
    5. Typical errors or punctuation quirks.
    6. Tone description (e.g., "Hasty but smart", "Overly formal trying to sound smart", "Casual").
    
    Samples:
    ${combinedText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vocabularyComplexity: { type: Type.NUMBER, description: "1-10 scale" },
            sentenceLengthVariance: { type: Type.NUMBER, description: "1-10 scale of how varied sentence lengths are" },
            grammarCorrectness: { type: Type.NUMBER, description: "1-10 scale (10 is perfect grammar)" },
            informalityLevel: { type: Type.NUMBER, description: "1-10 scale (10 is slang/chatty)" },
            commonConnectors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-5 transition words often used"
            },
            typicalErrors: {
               type: Type.ARRAY,
               items: { type: Type.STRING },
               description: "List of common mistakes or quirks"
            },
            toneDescription: { type: Type.STRING, description: "Short summary of the voice" }
          },
          required: ["vocabularyComplexity", "sentenceLengthVariance", "grammarCorrectness", "informalityLevel", "commonConnectors", "typicalErrors", "toneDescription"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as StyleMetrics;

  } catch (error) {
    console.error("Style analysis failed:", error);
    // Fallback default
    return {
      vocabularyComplexity: 5,
      sentenceLengthVariance: 5,
      grammarCorrectness: 8,
      informalityLevel: 5,
      commonConnectors: ["ну", "також", "коротше"],
      typicalErrors: ["пунктуація"],
      toneDescription: "Неможливо проаналізувати стиль."
    };
  }
};

/**
 * Humanizes AI text based on the analyzed profile
 */
export const humanizeText = async (
  targetText: string, 
  profile: StyleMetrics, 
  settings: TransformationSettings
): Promise<ProcessingResult> => {

  const profileDescription = `
    - Vocabulary Level: ${profile.vocabularyComplexity}/10
    - Grammar Level: ${profile.grammarCorrectness}/10
    - Informality: ${profile.informalityLevel}/10
    - Favorite Connectors: ${profile.commonConnectors.join(", ")}
    - Typical Quirks/Errors: ${profile.typicalErrors.join(", ")}
    - Tone: ${profile.toneDescription}
  `;

  const prompt = `
    Act as the student described below. Rewrite the "Target AI Text" to sound exactly like YOU wrote it.
    
    STUDENT PROFILE:
    ${profileDescription}

    SETTINGS:
    - Humanization Intensity: ${settings.humanizationLevel}%
    - Mode: ${settings.mode} (If "lazy", keep sentences simple and maybe miss a comma. If "try_hard", use big words incorrectly sometimes. If "balanced", just be natural).
    - Add Occasional Typos/Slips: ${settings.addTypos}
    - Retain Key Facts: ${settings.retainKeyFacts} (Do not hallucinate new facts, just restyle existing ones).

    TARGET AI TEXT:
    ${targetText}

    INSTRUCTIONS:
    Return a JSON object containing the 'humanized' text and a short 'changesExplanation' of what you did to make it sound human.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                humanized: { type: Type.STRING },
                changesExplanation: { type: Type.STRING }
            },
            required: ["humanized", "changesExplanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const json = JSON.parse(text);

    return {
      original: targetText,
      humanized: json.humanized,
      changesExplanation: json.changesExplanation
    };
  } catch (error) {
    console.error("Humanization failed:", error);
    throw error;
  }
};
