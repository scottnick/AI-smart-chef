
import { GoogleGenAI, Type } from "@google/genai";
import { Category, DetailLevel, GeminiRecipeResponse } from "./types";

const API_KEY = process.env.API_KEY || "";

export const generateRecipes = async (
  ingredients: string[],
  constraints: any
): Promise<GeminiRecipeResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `依據以下食材：${ingredients.join(', ')}。
  使用者需求：${constraints.user_free_text || '無'}。
  過敏原：${constraints.allergies.join(', ')}。
  飲食習慣：${constraints.dietary_rules.join(', ')}。
  可用器材：${constraints.equipment.join(', ')}。
  請生成 3-5 個食譜候選。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          request_summary: {
            type: Type.OBJECT,
            properties: {
              photos_used: { type: Type.INTEGER },
              detected_ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    confidence: { type: Type.STRING }
                  }
                }
              },
              user_constraints: {
                type: Type.OBJECT,
                properties: {
                  allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dietary_rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                  equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                  detail_level: { type: Type.STRING },
                  servings: { type: Type.INTEGER },
                  preferred_categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                  user_free_text: { type: Type.STRING }
                }
              }
            }
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                recipe_id: { type: Type.STRING },
                source: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                short_description: { type: Type.STRING },
                servings: { type: Type.INTEGER },
                total_time_minutes: { type: Type.INTEGER },
                calories_estimate_kcal: { type: Type.NUMBER },
                calories_confidence: { type: Type.STRING },
                equipment_needed: { type: Type.ARRAY, items: { type: Type.STRING } },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.STRING },
                      optional: { type: Type.BOOLEAN },
                      adjustable_note: { type: Type.STRING }
                    }
                  }
                },
                missing_or_substitutions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      missing: { type: Type.STRING },
                      substitute: { type: Type.STRING },
                      severity: { type: Type.STRING }
                    }
                  }
                },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      text: { type: Type.STRING },
                      estimated_minutes: { type: Type.INTEGER },
                      timer_seconds: { type: Type.NUMBER, nullable: true }
                    }
                  }
                },
                safety_notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
