import { GoogleGenAI, Type } from "@google/genai";
import { ReadingPassage, ListeningQuestions, PronunciationFeedback, VocabularyWord, GrammarExercise, DifficultyLevel } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateSpeakingPrompt = async (difficulty: DifficultyLevel): Promise<string> => {
  const prompt = `Generate a single, engaging, and thought-provoking conversation prompt for a ${difficulty} level English language learner to practice speaking. The prompt should be a question or a scenario. Provide only the prompt itself, without any introduction or labels.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating speaking prompt:", error);
    throw new Error("Could not connect to the AI service.");
  }
};

export const generateWritingTopic = async (difficulty: DifficultyLevel): Promise<string> => {
  const prompt = `Generate a single, interesting writing topic for a ${difficulty} level English learner. The topic should encourage them to write a short paragraph. Provide only the topic itself, without any introduction or labels. For example: "Describe your favorite holiday." or "What is a skill you would like to learn and why?"`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating writing topic:", error);
    throw new Error("Could not connect to the AI service for a topic.");
  }
};

export const correctWriting = async (text: string, difficulty: DifficultyLevel, topic?: string): Promise<string> => {
  const prompt = `You are an expert English teacher. Your feedback should be tailored for a ${difficulty} level learner.
  ${topic ? `An English learner was given the prompt: "${topic}". ` : ''}
  Here is their response: "${text}". 
  Please correct the response for grammar, spelling, punctuation, and style. Make the text sound more natural for a native speaker. 
  Provide only the corrected text followed by your comments, without any other preamble.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error correcting writing:", error);
    throw new Error("Could not connect to the AI service.");
  }
};

export const generateReadingPassage = async (difficulty: DifficultyLevel): Promise<ReadingPassage> => {
    const prompt = `Generate a short, interesting reading passage in English suitable for a ${difficulty} level learner (around 150-200 words). After the passage, provide 3 short-answer comprehension questions based on the text to test understanding.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        passage: {
                            type: Type.STRING,
                            description: "The reading passage for the user."
                        },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: {
                                        type: Type.STRING,
                                        description: "A comprehension question about the passage."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating reading passage:", error);
        throw new Error("Could not connect to the AI service to generate a passage.");
    }
};

export const generateListeningTranscript = async (difficulty: DifficultyLevel): Promise<string> => {
    const prompt = `Generate a short, clear conversation transcript between two people suitable for a ${difficulty} English learner. The transcript should be around 100-150 words. Provide only the transcript text.`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating listening transcript:", error);
        throw new Error("Could not connect to the AI service to generate a transcript.");
    }
};


export const generateListeningQuestions = async (transcript: string, difficulty: DifficultyLevel): Promise<ListeningQuestions> => {
    const prompt = `Based on the following conversation transcript, generate exactly 3 comprehension questions to test a ${difficulty} level user's listening skills. The questions should be about key details in the text. Transcript: "${transcript}"`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                         questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: {
                                        type: Type.STRING,
                                        description: "A comprehension question about the transcript."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating listening questions:", error);
        throw new Error("Could not connect to the AI service to generate questions.");
    }
};

export const generateGrammarExercise = async (difficulty: DifficultyLevel): Promise<GrammarExercise> => {
  const prompt = `Generate a single grammar exercise for a ${difficulty} level English learner. The exercise can be one of three types: 'multiple-choice', 'fill-in-the-blank', or 'sentence-correction'.
  
  - For 'multiple-choice', provide a question, 3-4 options, the correct answer, and an explanation.
  - For 'fill-in-the-blank', provide a sentence with a blank (e.g., using '___'), the correct word for the blank as the answer, and an explanation.
  - For 'sentence-correction', provide an incorrect sentence, the corrected sentence as the answer, and an explanation.

  Ensure the explanation is clear and helpful for a learner. Your response MUST be in JSON format according to the provided schema. The 'question' field should contain the full instruction for the user.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['multiple-choice', 'fill-in-the-blank', 'sentence-correction'] },
            question: { type: Type.STRING, description: "The instruction or sentence for the user." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "An array of options for multiple-choice questions. Optional."
            },
            answer: { type: Type.STRING, description: "The correct answer." },
            explanation: { type: Type.STRING, description: "An explanation of the grammar rule." }
          },
          required: ["type", "question", "answer", "explanation"]
        }
      }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error)
  {
    console.error("Error generating grammar exercise:", error);
    throw new Error("Could not connect to the AI service to generate an exercise.");
  }
};


export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  const prompt = `You are a highly advanced AI speech-to-text engine. Your task is to transcribe the following audio with the highest possible accuracy. Pay close attention to every word, including filler words. Punctuate the sentences correctly based on the speaker's intonation and pauses. Provide only the final, clean transcription text.`;
  try {
    const audioPart = { inlineData: { mimeType, data: audioBase64 } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [audioPart, textPart] },
    });

    return response.text?.trim() ?? "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Could not connect to the AI service for transcription.");
  }
};

export const getPronunciationFeedback = async (
  promptText: string,
  audioBase64: string,
  mimeType: string,
  transcript: string
): Promise<PronunciationFeedback> => {
  const prompt = `You are a strict but friendly English pronunciation coach. A language learner was given the following prompt to respond to: "${promptText}".

  Here is the transcription of their spoken response: "${transcript}".
  
  Now, listen to their audio response and provide detailed feedback based on BOTH the audio and the transcript.
  
  **CRITICAL INSTRUCTIONS:** You must evaluate the response by following these rules:

  1. **Content Relevance:** First, using the transcript, determine if the response is a direct and relevant answer to the prompt. If it is completely off-topic, you MUST assign an 'overallScore' of 0 and the 'overallFeedback' must state that the answer was not relevant. The other fields should have a short note about this.
  
  2. **Audio Quality:** If the response IS relevant, then check the audio. If it's silent or too short, assign a score of 0 and provide feedback that the audio was unclear.

  **If the response is relevant and the audio is clear, proceed with the detailed analysis:**
  - Analyze the pronunciation of the words in the transcript by listening to the audio.
  - The 'overallScore' (0-100) should reflect pronunciation, fluency, and intonation.
  - The 'wordsToPractice' array should highlight specific words from the transcript that were mispronounced in the audio, with tips on how to say them correctly.
  - Provide concise and helpful feedback for overall, fluency, and intonation.
  
  Your response MUST be in JSON format according to the provided schema.`;

  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [textPart, audioPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "A score from 0-100 for the user's pronunciation." },
            overallFeedback: { type: Type.STRING, description: "General, encouraging feedback on the user's performance." },
            wordsToPractice: {
              type: Type.ARRAY,
              description: "A list of specific words the user should practice.",
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "The word that was mispronounced." },
                  feedback: { type: Type.STRING, description: "Specific advice on how to pronounce the word correctly." }
                },
                required: ["word", "feedback"]
              }
            },
            fluencyFeedback: { type: Type.STRING, description: "Feedback on the rhythm and flow of the speech." },
            intonationFeedback: { type: Type.STRING, description: "Feedback on the rise and fall of the voice in speech." }
          },
          required: ["overallScore", "overallFeedback", "wordsToPractice", "fluencyFeedback", "intonationFeedback"]
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error getting pronunciation feedback:", error);
    throw new Error("Could not analyze the audio. Please try again.");
  }
};

export const generateVocabularyList = async (transcript: string): Promise<VocabularyWord[]> => {
  const prompt = `Based on the following text spoken by an English learner, please identify 5 to 10 relevant and useful vocabulary words that would be good for them to learn. The words should be challenging, around an SAT or advanced high school level. If the user's text is very simple, suggest related words that are more advanced. For each word, provide its meaning in Bengali (Bangla), a few synonyms, a few antonyms, an example sentence showing its usage, and a short explanation of when to use the word (usage context).

  The user's text: "${transcript}"

  Your response MUST be a JSON array. Each object in the array should represent a vocabulary word and follow the specified schema.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "The vocabulary word." },
              banglaMeaning: { type: Type.STRING, description: "The meaning of the word in Bengali (Bangla)." },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of synonyms for the word." },
              antonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of antonyms for the word." },
              exampleSentence: { type: Type.STRING, description: "An example sentence using the word." },
              usageContext: { type: Type.STRING, description: "A short explanation of when or how to use the word." }
            },
            required: ["word", "banglaMeaning", "synonyms", "antonyms", "exampleSentence", "usageContext"]
          }
        }
      }
    });
    
    const jsonText = response.text.trim();
    const cleanJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    return JSON.parse(cleanJsonText);

  } catch (error) {
    console.error("Error generating vocabulary list:", error);
    throw new Error("Could not generate a vocabulary list from the text.");
  }
};

export const generateSpokenEnglishTips = async (difficulty: DifficultyLevel): Promise<{ tip: string; explanation: string; }[]> => {
    const prompt = `Generate 5 unique, helpful, and actionable tips and tricks for a ${difficulty} level English language learner to improve their spoken English. Focus on practical advice they can apply immediately. For each tip, provide a short, catchy title ('tip') and a brief, clear 'explanation'.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            tip: {
                                type: Type.STRING,
                                description: "A short, catchy title for the tip."
                            },
                            explanation: {
                                type: Type.STRING,
                                description: "A brief, clear explanation of the tip."
                            }
                        },
                        required: ["tip", "explanation"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating spoken English tips:", error);
        throw new Error("Could not connect to the AI service to generate tips.");
    }
};