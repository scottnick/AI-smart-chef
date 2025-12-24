
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 min-w-[280px] md:min-w-0"
    >
      <div className="h-40 bg-gray-200 relative">
        <img 
          src={`https://picsum.photos/seed/${recipe.recipe_id}/400/300`} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-blue-600">
          {recipe.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{recipe.title}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{recipe.short_description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span><i className="fa-regular fa-clock mr-1"></i>{recipe.total_time_minutes} min</span>
            {recipe.calories_estimate_kcal && (
              <span><i className="fa-solid fa-fire-flame-curved mr-1 text-orange-400"></i>{recipe.calories_estimate_kcal} kcal (估)</span>
            )}
          </div>
          {recipe.rating && (
            <div className="flex items-center text-yellow-500 font-bold">
              <i className="fa-solid fa-star mr-1"></i>
              {recipe.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
