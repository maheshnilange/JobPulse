import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn('Failed to initialize Gemini AI Client:', e);
    }
  }
  return aiClient;
}

export class GeminiService {
  /**
   * Summarizes raw job descriptions and extracts key fresher takeaways
   */
  public static async analyzeJobDescription(rawText: string): Promise<{
    summary: string;
    keyHighlights: string[];
    interviewTips: string[];
  }> {
    const ai = getAIClient();
    if (!ai) {
      // Rule-based fallback if API key is not configured
      return {
        summary: 'Entry-level software position focusing on Core Java, Spring Boot, and enterprise API design with mentoring and structured onboarding.',
        keyHighlights: [
          'Direct mentorship from Senior Architects',
          'Industry standard salary package with performance incentives',
          'Comprehensive training in modern cloud native microservices'
        ],
        interviewTips: [
          'Revise Core Java fundamentals: OOP concepts, Collections Framework, Multithreading & Exception handling',
          'Practice writing clean SQL queries (Joins, Indexing, Group By)',
          'Prepare a walk-through of your final-year college or personal Spring Boot projects'
        ]
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an expert Fresher IT Career Advisor. Analyze this job description for freshers and return a concise summary, key highlights, and technical interview preparation tips:

Job Description:
${rawText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A 2-sentence executive summary tailored for freshers'
              },
              keyHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of 3 high-impact bullet points'
              },
              interviewTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of 3 specific technical prep tips for freshers'
              }
            },
            required: ['summary', 'keyHighlights', 'interviewTips']
          }
        }
      });

      const text = response.text || '';
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return {
        summary: 'Entry-level engineering role suitable for fresh graduates with strong programming fundamentals.',
        keyHighlights: ['Continuous learning environment', 'Hands-on project work', 'Structured growth path'],
        interviewTips: ['Review Java OOP & Data Structures', 'Practice live coding', 'Prepare resume projects']
      };
    }
  }
}

