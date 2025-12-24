
export enum Category {
  NOODLES = '麵類',
  RICE = '飯類',
  SOUP = '湯品',
  HOTPOT = '火鍋',
  DESSERT = '甜點'
}

export enum Confidence {
  HIGH = 'high',
  LOW = 'low'
}

export enum DetailLevel {
  DETAILED = 'detailed',
  CONCISE = 'concise'
}

export interface Ingredient {
  name: string;
  amount: string;
  optional: boolean;
  adjustable_note: string;
}

export interface DetectedIngredient {
  name: string;
  confidence: Confidence;
}

export interface Substitution {
  missing: string;
  substitute: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Step {
  step: number;
  title: string;
  text: string;
  estimated_minutes: number;
  timer_seconds: number | null;
}

export interface Recipe {
  recipe_id: string;
  source: 'seed' | 'ai';
  title: string;
  category: Category;
  short_description: string;
  servings: number;
  total_time_minutes: number;
  calories_estimate_kcal: number;
  calories_confidence: 'estimate';
  equipment_needed: string[];
  ingredients: Ingredient[];
  missing_or_substitutions: Substitution[];
  steps: Step[];
  safety_notes: string[];
  tags: string[];
  rating?: number;
  review_count?: number;
}

export interface UserConstraints {
  allergies: string[];
  dietary_rules: string[];
  equipment: string[];
  detail_level: DetailLevel;
  servings: number;
  preferred_categories: Category[];
  user_free_text?: string;
}

export interface GeminiRecipeResponse {
  request_summary: {
    photos_used: number;
    detected_ingredients: DetectedIngredient[];
    user_constraints: UserConstraints;
  };
  recipes: Recipe[];
}

export interface UserProfile {
  displayName: string;
  allergies: string[];
  dietaryRules: string[];
  equipment: string[];
  detailLevel: DetailLevel;
  optInCloud: boolean;
}
