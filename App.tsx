
import React, { useState, useEffect } from 'react';
import { Category, Recipe, UserProfile, DetailLevel, GeminiRecipeResponse, UserConstraints } from './types';
import { INITIAL_USER_PROFILE, APP_CATEGORIES } from './constants';
import { InfoIcon } from './components/InfoIcon';
import { RecipeCard } from './components/RecipeCard';
import { generateRecipes } from './geminiService';
import { SEED_RECIPES, SeedRecipe } from './seedRecipes';

// --- Category List Page ---
const CategoryListPage: React.FC<{ 
  category: Category, 
  onBack: () => void, 
  onSelectRecipe: (r: Recipe | SeedRecipe) => void 
}> = ({ category, onBack, onSelectRecipe }) => {
  const recipes = SEED_RECIPES.filter(r => r.category === category);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur z-20">
        <button onClick={onBack} className="text-gray-600 w-10 h-10 flex items-center justify-center">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h2 className="font-bold text-xl">{category}全部推薦</h2>
      </div>
      <div className="p-4 space-y-6 pb-24">
        {recipes.map(recipe => (
          <div key={recipe.recipe_id} className="w-full">
             <RecipeCard recipe={recipe as any} onClick={() => onSelectRecipe(recipe)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Onboarding Page ---
const OnboardingPage: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<UserProfile, 'updatedAt'>>({
    displayName: '',
    allergies: [],
    dietaryRules: [],
    equipment: [],
    detailLevel: DetailLevel.DETAILED,
    language: 'zh-TW',
    optInCloud: false,
  });

  const toggleItem = (listName: 'allergies' | 'dietaryRules' | 'equipment', item: string) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].includes(item)
        ? (prev[listName] as string[]).filter(i => i !== item)
        : [...(prev[listName] as string[]), item]
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.displayName.trim()) return;
    if (step < 5) setStep(s => s + 1);
    else {
      onComplete({ ...formData, updatedAt: Date.now() });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-800">歡迎！<br/>該如何稱呼您呢？</h2>
            <div className="relative">
              <input 
                type="text"
                placeholder="請輸入您的暱稱"
                className="w-full border-b-2 border-gray-200 py-4 text-xl outline-none focus:border-blue-500 transition-colors"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              />
              {!formData.displayName && <p className="text-xs text-red-400 mt-2">這欄位是必填的喔！</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800">您對哪些食材過敏？</h2>
            <p className="text-sm text-gray-400">我們會自動在食譜中過濾或提供替代方案。</p>
            <div className="grid grid-cols-2 gap-3">
              {['蝦', '蟹', '花生', '牛奶', '蛋', '大豆', '堅果', '麩質'].map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem('allergies', item)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.allergies.includes(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{item}</span>
                    {formData.allergies.includes(item) && <i className="fa-solid fa-circle-check text-blue-500"></i>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800">有任何飲食禁忌嗎？</h2>
            <p className="text-sm text-gray-400">這將幫助我們推薦更適合您的料理方式。</p>
            <div className="grid grid-cols-1 gap-3">
              {['全素食', '蛋奶素', '不吃牛', '低醣 (Low Carb)', '低脂', '低鈉'].map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem('dietaryRules', item)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${formData.dietaryRules.includes(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
                >
                  <span className="font-bold">{item}</span>
                  {formData.dietaryRules.includes(item) && <i className="fa-solid fa-circle-check text-blue-500"></i>}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800">您家中有哪些器材？</h2>
            <p className="text-sm text-gray-400">根據器材，AI 將自動調整烹飪流程。</p>
            <div className="grid grid-cols-2 gap-3">
              {['電鍋', '氣炸鍋', '烤箱', '微波爐', '平底鍋', '燉鍋'].map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem('equipment', item)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.equipment.includes(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{item}</span>
                    {formData.equipment.includes(item) && <i className="fa-solid fa-circle-check text-blue-500"></i>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 text-center py-4">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
              <i className="fa-solid fa-check-double"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">設定完成！</h2>
              <p className="text-gray-500 px-6">太棒了，{formData.displayName}！您的 AI 主廚已經準備好為您量身打造專屬食譜。</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">資料摘要</p>
              <p className="text-sm"><span className="text-gray-400">稱呼：</span>{formData.displayName}</p>
              <p className="text-sm"><span className="text-gray-400">過敏：</span>{formData.allergies.join(', ') || '無'}</p>
              <p className="text-sm"><span className="text-gray-400">習慣：</span>{formData.dietaryRules.join(', ') || '無'}</p>
              <p className="text-sm"><span className="text-gray-400">器材：</span>{formData.equipment.join(', ') || '基本廚具'}</p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8">
      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
      </div>

      <div className="flex-1">
        {renderStepContent()}
      </div>

      <div className="flex gap-4 pt-8">
        {step > 1 && step < 5 && (
          <button 
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200"
          >
            返回
          </button>
        )}
        <button 
          disabled={step === 1 && !formData.displayName.trim()}
          onClick={handleNext}
          className={`flex-1 py-4 font-bold rounded-2xl shadow-lg transition-all ${step === 1 && !formData.displayName.trim() ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {step === 5 ? '開始探索食譜' : '下一步'}
        </button>
      </div>
    </div>
  );
};

// --- Home Page ---
const HomePage: React.FC<{ 
  onSelectRecipe: (r: Recipe | SeedRecipe) => void,
  onSeeMore: (cat: Category) => void
}> = ({ onSelectRecipe, onSeeMore }) => {
  const [sortBy, setSortBy] = useState('Top5(綜合)');
  
  const top5Recipes = [...SEED_RECIPES].sort((a, b) => {
    if (sortBy === '評分最高') return b.rating - a.rating;
    if (sortBy === '最流行(近期)') return b.review_count - a.review_count;
    return (b.rating * b.review_count) - (a.rating * a.review_count);
  }).slice(0, 5);

  return (
    <div className="pb-24">
      <div className="px-4 py-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">熱門排行榜 (Top 5)</h2>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option>Top5(綜合)</option>
            <option>評分最高</option>
            <option>最流行(近期)</option>
            <option>我最常煮</option>
            <option>我的最愛</option>
          </select>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {top5Recipes.map((recipe, idx) => (
            <div key={recipe.recipe_id} className="relative flex-shrink-0">
              <div className="absolute -top-2 -left-2 z-10 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                {idx + 1}
              </div>
              <RecipeCard recipe={recipe as any} onClick={() => onSelectRecipe(recipe)} />
            </div>
          ))}
        </div>
      </div>

      {APP_CATEGORIES.map(cat => {
        const catRecipes = SEED_RECIPES.filter(r => r.category === cat).slice(0, 4);
        return (
          <section key={cat} className="mt-8 px-4">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-gray-800">{cat}推薦</h3>
              <button 
                onClick={() => onSeeMore(cat)}
                className="text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                查看更多 <i className="fa-solid fa-chevron-right ml-1 text-[10px]"></i>
              </button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
              {catRecipes.map(recipe => (
                <RecipeCard 
                  key={recipe.recipe_id}
                  recipe={recipe as any}
                  onClick={() => onSelectRecipe(recipe)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// --- Camera Page ---
const CameraPage: React.FC<{ onConfirm: (ing: string[]) => void }> = ({ onConfirm }) => {
  const [step, setStep] = useState<'camera' | 'confirm'>('camera');
  const [ingredients, setIngredients] = useState<string[]>(['雞肉', '馬鈴薯', '洋蔥']);
  const [newIng, setNewIng] = useState('');

  if (step === 'camera') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
          <img src="https://picsum.photos/seed/camera/800/1200" className="w-full h-full object-cover opacity-60" alt="camera view" />
          <div className="absolute top-10 right-4">
            <InfoIcon title="拍照說明" content="請將相機對準食材，確保光線充足。我們能自動識別桌上的生鮮食材並提供烹飪建議。" />
          </div>
          <div className="absolute bottom-10 flex flex-col items-center gap-6 w-full">
            <button 
              onClick={() => setStep('confirm')}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 active:scale-95 transition-transform"
            ></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={() => setStep('camera')} className="text-gray-600"><i className="fa-solid fa-arrow-left text-xl"></i></button>
        <h2 className="font-bold text-lg">確認食材</h2>
        <button onClick={() => onConfirm(ingredients)} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">生成食譜</button>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">辨識結果</label>
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ing => (
              <div key={ing} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm border border-blue-100">
                {ing}
                <button onClick={() => setIngredients(prev => prev.filter(x => x !== ing))} className="text-blue-300 hover:text-blue-500">
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">手動新增</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              placeholder="輸入食材名稱..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={() => { if(newIng) { setIngredients(prev => [...prev, newIng]); setNewIng(''); } }}
              className="bg-gray-100 text-gray-600 px-4 rounded-xl"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Candidate Page ---
const CandidatePage: React.FC<{ recipes: Recipe[], onSelect: (r: Recipe) => void }> = ({ recipes, onSelect }) => {
  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-2">為您生成了 {recipes.length} 個提案</h2>
      <p className="text-gray-500 mb-6 text-sm">點擊查看詳細步驟與營養分析：</p>
      <div className="grid grid-cols-1 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.recipe_id} onClick={() => onSelect(recipe)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-32 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-32 bg-gray-100">
              <img src={`https://picsum.photos/seed/${recipe.recipe_id}/200/200`} className="w-full h-full object-cover" alt={recipe.title} />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{recipe.title}</h3>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{recipe.short_description}</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500">
                <span><i className="fa-regular fa-clock mr-1"></i>{recipe.total_time_minutes} 分鐘</span>
                <span><i className="fa-solid fa-fire-flame-curved mr-1 text-orange-400"></i>{recipe.calories_estimate_kcal} kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Recipe Detail & Chef Mode ---
const RecipeDetailPage: React.FC<{ recipe: Recipe, onBack: () => void }> = ({ recipe, onBack }) => {
  const [isChefMode, setIsChefMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    let interval: any;
    if (timer !== null && timer > 0) {
      interval = setInterval(() => setTimer(prev => (prev !== null ? prev - 1 : null)), 1000);
    } else if (timer === 0) {
      alert("計時結束！");
      setTimer(null);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (isChefMode) {
    const step = recipe.steps[currentStep];
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-blue-600 uppercase tracking-widest text-xs">烹飪引導 (Step {currentStep + 1}/{recipe.steps.length})</h3>
          <button onClick={() => setIsChefMode(false)} className="text-gray-400"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <h4 className="text-2xl font-bold mb-4">{step.title}</h4>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">{step.text}</p>
          {step.timer_seconds !== null && (
            <div className="mb-8">
              {timer !== null ? (
                <div className="text-6xl font-black text-blue-600 tabular-nums">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</div>
              ) : (
                <button 
                  onClick={() => setTimer(step.timer_seconds)}
                  className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg"
                >開始計時 ({step.timer_seconds}秒)</button>
              )}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-4">
          <button disabled={currentStep === 0} onClick={() => {setCurrentStep(s => s - 1); setTimer(null);}} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500 disabled:opacity-50">上一步</button>
          <button 
            onClick={() => {
              if (currentStep === recipe.steps.length - 1) { setIsChefMode(false); alert("大功告成！"); }
              else { setCurrentStep(s => s + 1); setTimer(null); }
            }}
            className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white"
          >{currentStep === recipe.steps.length - 1 ? '完成' : '下一步'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="relative h-64">
        <img src={`https://picsum.photos/seed/${recipe.recipe_id}/800/600`} className="w-full h-full object-cover" alt={recipe.title} />
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/60 backdrop-blur rounded-full flex items-center justify-center"><i className="fa-solid fa-chevron-left"></i></button>
        <button onClick={() => setIsChefMode(true)} className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">進入烹飪模式</button>
      </div>
      <div className="px-6 py-8 -mt-8 bg-white rounded-t-[32px] relative">
        <h1 className="text-2xl font-black text-gray-800 mb-4">{recipe.title}</h1>
        <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50 rounded-2xl p-4 text-center">
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">時間</p><p className="text-sm font-bold">{recipe.total_time_minutes}m</p></div>
          <div className="border-x border-gray-200"><p className="text-[10px] text-gray-400 font-bold mb-1">份量</p><p className="text-sm font-bold">{recipe.servings}人</p></div>
          <div className="border-r border-gray-200"><p className="text-[10px] text-gray-400 font-bold mb-1">熱量</p><p className="text-sm font-bold text-orange-500">{recipe.calories_estimate_kcal}k</p></div>
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">難度</p><p className="text-sm font-bold">中</p></div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">準備食材</h3>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">{ing.name} {ing.optional && <span className="text-[10px] text-gray-300">(可選)</span>}</span>
                <span className="font-bold">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>
        {recipe.missing_or_substitutions.length > 0 && (
          <div className="mb-8 bg-orange-50 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-orange-800 mb-2"><i className="fa-solid fa-circle-exclamation mr-2"></i>缺少食材建議</h4>
            <div className="space-y-1">
              {recipe.missing_or_substitutions.map((sub, idx) => (
                <p key={idx} className="text-xs text-orange-700">缺 <b>{sub.missing}</b>：可用 <b>{sub.substitute}</b> 替代</p>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">烹飪步驟</h3>
          <div className="space-y-6">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{step.step}</div>
                <div><h4 className="font-bold mb-1">{step.title}</h4><p className="text-sm text-gray-600 leading-relaxed">{step.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Profile Page ---
const ProfilePage: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-8">個人中心</h2>
    <div className="flex items-center gap-4 mb-8">
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl"><i className="fa-solid fa-user"></i></div>
      <div><h3 className="text-xl font-bold">主廚之路</h3><p className="text-sm text-gray-400">已解鎖 12 道食譜</p></div>
    </div>
    <div className="space-y-4">
      {['我的最愛', '烹飪紀錄', '過敏原與偏好', '關於 AI Smart Chef'].map(label => (
        <button key={label} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <i className="fa-solid fa-chevron-right text-gray-300"></i>
        </button>
      ))}
    </div>
  </div>
);

// --- Main App Controller ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'camera' | 'profile'>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [candidates, setCandidates] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastClickedSeed, setLastClickedSeed] = useState<SeedRecipe | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user_profile_v1');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.displayName) setShowOnboarding(false);
        else setShowOnboarding(true);
      } catch (e) { setShowOnboarding(true); }
    } else setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem('user_profile_v1', JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const handleRecipeSelection = async (recipe: Recipe | SeedRecipe) => {
    if (recipe.source === 'seed') {
      const seed = recipe as SeedRecipe;
      setLastClickedSeed(seed);
      setGenerationError(null);
      setIsGenerating(true);

      try {
        const storedProfile = localStorage.getItem('user_profile_v1');
        const profile: UserProfile = storedProfile ? JSON.parse(storedProfile) : INITIAL_USER_PROFILE;

        // Correct Mapping from camelCase to snake_case for the API
        const constraints: UserConstraints = {
          allergies: profile.allergies,
          dietary_rules: profile.dietaryRules,
          equipment: profile.equipment,
          detail_level: profile.detailLevel,
          servings: seed.servings,
          preferred_categories: [seed.category],
          user_free_text: `此為「${seed.title}」食譜基底。描述為：${seed.short_description}。請根據此描述與現有食材「${seed.seed_ingredients.join(', ')}」生成具體步驟。`
        };

        const result = await generateRecipes(seed.seed_ingredients, constraints);
        
        if (result.recipes && result.recipes.length > 0) {
          const aiGenerated = result.recipes[0];
          const fullRecipe: Recipe = {
            ...aiGenerated,
            recipe_id: seed.recipe_id,
            title: seed.title,
            category: seed.category,
            short_description: seed.short_description,
            source: 'ai',
          };
          setSelectedRecipe(fullRecipe);
        } else {
          throw new Error("AI 無法生成合適的食譜步驟。");
        }
      } catch (e: any) {
        console.error("[AI Generation Error]", e);
        setGenerationError(`發生錯誤: ${e.message || "未知伺服器錯誤"}`);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setSelectedRecipe(recipe as Recipe);
    }
  };

  const handleCameraConfirm = async (ingredients: string[]) => {
    setIsGenerating(true);
    setActiveTab('home');
    setGenerationError(null);
    try {
      const result = await generateRecipes(ingredients, INITIAL_USER_PROFILE);
      setCandidates(result.recipes);
    } catch (e: any) {
      console.error(e);
      setGenerationError(`掃描識別失敗: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (selectedRecipe) {
      return <RecipeDetailPage recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
    }

    if (generationError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">研製過程出錯</h2>
          <p className="text-gray-400 text-sm mb-8">{generationError}</p>
          <div className="flex gap-4 w-full">
            <button onClick={() => setGenerationError(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">返回</button>
            <button 
              onClick={() => lastClickedSeed && handleRecipeSelection(lastClickedSeed)}
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200"
            >重新嘗試</button>
          </div>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold mb-2">AI 主廚研製中...</h2>
          <p className="text-gray-500 text-sm">正在根據您的個人化需求規劃專屬食譜細節</p>
        </div>
      );
    }

    if (activeCategory) {
      return (
        <CategoryListPage 
          category={activeCategory} 
          onBack={() => setActiveCategory(null)} 
          onSelectRecipe={handleRecipeSelection} 
        />
      );
    }

    switch (activeTab) {
      case 'camera': return <CameraPage onConfirm={handleCameraConfirm} />;
      case 'home':
        if (candidates.length > 0) {
          return (
            <div>
              <div className="p-4 flex items-center gap-2">
                <button onClick={() => setCandidates([])} className="text-blue-500 font-bold text-sm"><i className="fa-solid fa-chevron-left mr-1"></i> 返回首頁</button>
              </div>
              <CandidatePage recipes={candidates} onSelect={setSelectedRecipe} />
            </div>
          );
        }
        return <HomePage 
                 onSelectRecipe={handleRecipeSelection} 
                 onSeeMore={setActiveCategory} 
               />;
      case 'profile': return <ProfilePage />;
      default: return null;
    }
  };

  if (showOnboarding === null) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (showOnboarding) return <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg"><OnboardingPage onComplete={handleOnboardingComplete} /></div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>
      {!selectedRecipe && activeTab !== 'camera' && !isGenerating && !activeCategory && !generationError && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur border-t border-gray-100 flex justify-around py-4 z-50 rounded-t-3xl shadow-2xl shadow-blue-900/10">
          <button onClick={() => {setActiveTab('home'); setCandidates([]);}} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
            <i className="fa-solid fa-house-chimney text-xl"></i><span className="text-[10px] font-bold">探索</span>
          </button>
          <button onClick={() => setActiveTab('camera')} className="flex flex-col items-center gap-1 -mt-10">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200 active:scale-90 transition-transform">
              <i className="fa-solid fa-camera text-2xl"></i>
            </div>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}>
            <i className="fa-solid fa-user text-xl"></i><span className="text-[10px] font-bold">個人</span>
          </button>
        </nav>
      )}
    </div>
  );
}
