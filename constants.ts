
import { Category, DetailLevel, UserProfile } from './types';

export const APP_CATEGORIES = [
  Category.NOODLES,
  Category.RICE,
  Category.SOUP,
  Category.HOTPOT,
  Category.DESSERT
];

// Fixed: Added missing language and updatedAt properties to satisfy UserProfile interface
export const INITIAL_USER_PROFILE: UserProfile = {
  displayName: '廚藝新秀',
  allergies: [],
  dietaryRules: [],
  equipment: ['電鍋', '炒鍋', '烤箱'],
  detailLevel: DetailLevel.DETAILED,
  language: 'zh-TW',
  updatedAt: Date.now(),
  optInCloud: false
};

export const COMMON_INGREDIENTS = [
  '雞蛋', '豬絞肉', '蔥', '蒜頭', '洋蔥', '高麗菜', '番茄', '豆腐', '雞胸肉'
];
