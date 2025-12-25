
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Recipe, UserProfile, DetailLevel, GeminiRecipeResponse, UserConstraints, Ingredient } from './types';
import { INITIAL_USER_PROFILE, APP_CATEGORIES } from './constants';
import { InfoIcon } from './components/InfoIcon';
import { RecipeCard } from './components/RecipeCard';
import { generateRecipes } from './geminiService';
import { SEED_RECIPES, SeedRecipe } from './seedRecipes';

// --- Helper Functions ---
const scaleAmount = (amount: string, ratio: number) => {
  return amount.replace(/(\d+(\.\d+)?)/g, (match) => {
    const num = parseFloat(match);
    return String(Math.round(num * ratio * 10) / 10);
  });
};

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

// --- Onboarding Page (Minimal Change: Keep Logic) ---
const OnboardingPage: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<UserProfile, 'updatedAt'>>({
    displayName: '', allergies: [], dietaryRules: [], equipment: [], detailLevel: DetailLevel.DETAILED, language: 'zh-TW', optInCloud: false,
  });
  const toggleItem = (listName: 'allergies' | 'dietaryRules' | 'equipment', item: string) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].includes(item) ? (prev[listName] as string[]).filter(i => i !== item) : [...(prev[listName] as string[]), item] }));
  };
  const handleNext = () => { if (step === 1 && !formData.displayName.trim()) return; if (step < 5) setStep(s => s + 1); else onComplete({ ...formData, updatedAt: Date.now() }); };
  return (
    <div className="min-h-screen bg-white flex flex-col p-8">
      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-12 overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div></div>
      <div className="flex-1">
        {step === 1 && <div className="space-y-6"><h2 className="text-2xl font-black text-gray-800">歡迎！<br/>該如何稱呼您呢？</h2><input type="text" placeholder="請輸入您的暱稱" className="w-full border-b-2 border-gray-200 py-4 text-xl outline-none focus:border-blue-500" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} /></div>}
        {step === 2 && <div className="space-y-4"><h2 className="text-2xl font-black text-gray-800">您對哪些食材過敏？</h2><div className="grid grid-cols-2 gap-3">{['蝦', '蟹', '花生', '牛奶', '蛋', '大豆', '堅果', '麩質'].map(item => (<button key={item} onClick={() => toggleItem('allergies', item)} className={`p-4 rounded-2xl border-2 text-left ${formData.allergies.includes(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}><span className="font-bold">{item}</span></button>))}</div></div>}
        {step === 3 && <div className="space-y-4"><h2 className="text-2xl font-black text-gray-800">有任何飲食禁忌嗎？</h2><div className="grid grid-cols-1 gap-3">{['全素食', '蛋奶素', '不吃牛', '低醣', '低脂', '低鈉'].map(item => (<button key={item} onClick={() => toggleItem('dietaryRules', item)} className={`p-4 rounded-2xl border-2 text-left flex justify-between ${formData.dietaryRules.includes(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}><span className="font-bold">{item}</span></button>))}</div></div>}
        {step === 4 && <div className="space-y-4"><h2 className="text-2xl font-black text-gray-800">您家中有哪些器材？</h2><div className="grid grid-cols-2 gap-3">{['電鍋', '氣炸鍋', '烤箱', '微波爐', '平底鍋', '燉鍋'].map(item => (<button key={item} onClick={() => toggleItem('equipment', item)} className={`p-4 rounded-2xl border-2 text-left ${formData.equipment.includes(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}><span className="font-bold">{item}</span></button>))}</div></div>}
        {step === 5 && <div className="space-y-8 text-center py-4"><div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto"><i className="fa-solid fa-check-double"></i></div><h2 className="text-2xl font-black text-gray-800">設定完成！</h2></div>}
      </div>
      <div className="flex gap-4 pt-8">
        {step > 1 && step < 5 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">返回</button>}
        <button disabled={step === 1 && !formData.displayName.trim()} onClick={handleNext} className={`flex-1 py-4 font-bold rounded-2xl ${step === 1 && !formData.displayName.trim() ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white shadow-lg'}`}>{step === 5 ? '開始探索食譜' : '下一步'}</button>
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
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-200 text-sm rounded-lg px-2 py-1 outline-none">
            <option>Top5(綜合)</option>
            <option>評分最高</option>
            <option>最流行(近期)</option>
          </select>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {top5Recipes.map((recipe, idx) => (
            <div key={recipe.recipe_id} className="relative flex-shrink-0">
              <div className="absolute -top-2 -left-2 z-10 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">{idx + 1}</div>
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
              <button onClick={() => onSeeMore(cat)} className="text-blue-500 text-sm font-medium">查看更多 <i className="fa-solid fa-chevron-right ml-1 text-[10px]"></i></button>
            </div>
            {/* Wrapper 加 flex-shrink-0 固定寬度以達成橫向捲動 */}
            <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
              {catRecipes.map(recipe => (
                <div key={recipe.recipe_id} className="flex-shrink-0 w-[260px]">
                  <RecipeCard recipe={recipe as any} onClick={() => onSelectRecipe(recipe)} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// --- Camera Page (Minimal Change: Keep Logic) ---
const CameraPage: React.FC<{ onConfirm: (ing: string[]) => void }> = ({ onConfirm }) => {
  const [step, setStep] = useState<'camera' | 'confirm'>('camera');
  const [ingredients, setIngredients] = useState<string[]>(['雞肉', '馬鈴薯', '洋蔥']);
  if (step === 'camera') return <div className="fixed inset-0 bg-black flex flex-col z-50"><img src="https://picsum.photos/seed/camera/800/1200" className="w-full h-full object-cover opacity-60" alt="camera view" /><button onClick={() => setStep('confirm')} className="absolute bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-4 border-gray-400"></button></div>;
  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10"><button onClick={() => setStep('camera')}><i className="fa-solid fa-arrow-left"></i></button><h2 className="font-bold">確認食材</h2><button onClick={() => onConfirm(ingredients)} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">生成食譜</button></div>
      <div className="p-6"><div className="flex flex-wrap gap-2">{ingredients.map(ing => (<div key={ing} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">{ing}<button onClick={() => setIngredients(prev => prev.filter(x => x !== ing))}><i className="fa-solid fa-circle-xmark"></i></button></div>))}</div></div>
    </div>
  );
};

// --- Candidate Page ---
const CandidatePage: React.FC<{ recipes: Recipe[], onSelect: (r: Recipe) => void }> = ({ recipes, onSelect }) => {
  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-2">為您生成了 {recipes.length} 個提案</h2>
      <div className="grid grid-cols-1 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.recipe_id} onClick={() => onSelect(recipe)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-32 cursor-pointer hover:shadow-md">
            <div className="w-32 bg-gray-100"><img src={`https://picsum.photos/seed/${recipe.recipe_id}/200/200`} className="w-full h-full object-cover" alt={recipe.title} /></div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <h3 className="font-bold text-gray-800 line-clamp-1">{recipe.title}</h3>
              <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500"><span><i className="fa-regular fa-clock mr-1"></i>{recipe.total_time_minutes}m</span><span><i className="fa-solid fa-fire-flame-curved mr-1 text-orange-400"></i>{recipe.calories_estimate_kcal}k</span></div>
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
  const [servingsModalOpen, setServingsModalOpen] = useState(false);
  const [localServings, setLocalServings] = useState(recipe.servings);

  const ratio = localServings / recipe.servings;

  // 食材分組邏輯
  const groupedIngredients = useMemo(() => {
    const main: Ingredient[] = [];
    const auxiliary: Ingredient[] = [];
    const seasoning: Ingredient[] = [];
    recipe.ingredients.forEach(ing => {
      const scaledName = ing.name.replace(/【(預備|輔料|調味)】/g, '');
      const scaledIng = { ...ing, name: scaledName, amount: scaleAmount(ing.amount, ratio) };
      if (ing.name.startsWith('【輔料】')) auxiliary.push(scaledIng);
      else if (ing.name.startsWith('【調味】')) seasoning.push(scaledIng);
      else main.push(scaledIng);
    });
    return { main, auxiliary, seasoning };
  }, [recipe.ingredients, ratio]);

  if (isChefMode) {
    const step = recipe.steps[currentStep];
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-blue-600 text-xs">烹飪引導 ({currentStep + 1}/{recipe.steps.length})</h3><button onClick={() => setIsChefMode(false)}><i className="fa-solid fa-xmark text-xl"></i></button></div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center"><h4 className="text-2xl font-bold mb-4">{step.title}</h4><p className="text-lg text-gray-600 leading-relaxed mb-8">{step.text}</p></div>
        <div className="p-6 border-t border-gray-100 flex gap-4"><button disabled={currentStep === 0} onClick={() => setCurrentStep(s => s - 1)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">上一步</button><button onClick={() => { if (currentStep === recipe.steps.length - 1) setIsChefMode(false); else setCurrentStep(s => s + 1); }} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white">{currentStep === recipe.steps.length - 1 ? '完成' : '下一步'}</button></div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="relative h-64">
        <img src={`https://picsum.photos/seed/${recipe.recipe_id}/800/600`} className="w-full h-full object-cover" alt={recipe.title} />
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/60 backdrop-blur rounded-full flex items-center justify-center"><i className="fa-solid fa-chevron-left"></i></button>
        <button onClick={() => setIsChefMode(true)} className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm">進入烹飪模式</button>
      </div>
      <div className="px-6 py-8 -mt-8 bg-white rounded-t-[32px] relative">
        <h1 className="text-2xl font-black text-gray-800 mb-4">{recipe.title}</h1>
        <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50 rounded-2xl p-4 text-center">
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">時間</p><p className="text-sm font-bold">{recipe.total_time_minutes}m</p></div>
          <div className="border-x border-gray-200 cursor-pointer" onClick={() => setServingsModalOpen(true)}>
            <p className="text-[10px] text-gray-400 font-bold mb-1">份量 <i className="fa-solid fa-sliders text-[8px] ml-1"></i></p>
            <p className="text-sm font-bold text-blue-600 underline underline-offset-4">{localServings}人</p>
          </div>
          <div className="border-r border-gray-200"><p className="text-[10px] text-gray-400 font-bold mb-1">熱量</p><p className="text-sm font-bold text-orange-500">{Math.round(recipe.calories_estimate_kcal * ratio)}k</p></div>
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">難度</p><p className="text-sm font-bold">中</p></div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">準備食材</h3>
          <div className="space-y-4">
            {/* 分組顯示：使用 details/summary */}
            <details open className="group">
              <summary className="font-bold text-sm text-gray-700 list-none cursor-pointer flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-lg">
                <span>預備食材 ({groupedIngredients.main.length})</span>
                <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-open:rotate-180"></i>
              </summary>
              <div className="space-y-3 px-2">
                {groupedIngredients.main.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 text-sm">
                    <span className="text-gray-600">{ing.name}</span>
                    <span className="font-bold">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </details>

            {groupedIngredients.auxiliary.length > 0 && (
              <details className="group">
                <summary className="font-bold text-sm text-gray-400 list-none cursor-pointer flex justify-between items-center mb-2 bg-gray-50/50 p-2 rounded-lg">
                  <span>輔料 ({groupedIngredients.auxiliary.length})</span>
                  <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-open:rotate-180"></i>
                </summary>
                <div className="space-y-3 px-2">
                  {groupedIngredients.auxiliary.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 text-sm text-gray-400">
                      <span>{ing.name}</span><span>{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {groupedIngredients.seasoning.length > 0 && (
              <details className="group">
                <summary className="font-bold text-sm text-gray-400 list-none cursor-pointer flex justify-between items-center mb-2 bg-gray-50/50 p-2 rounded-lg">
                  <span>調味料 ({groupedIngredients.seasoning.length})</span>
                  <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-open:rotate-180"></i>
                </summary>
                <div className="space-y-3 px-2">
                  {groupedIngredients.seasoning.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 text-sm text-gray-400">
                      <span>{ing.name}</span><span>{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>

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

      {/* Servings Adjustment Modal */}
      {servingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl">
            <h4 className="text-xl font-bold mb-6">調整烹飪份量</h4>
            <div className="flex items-center justify-center gap-8 mb-8">
              <button onClick={() => setLocalServings(s => Math.max(1, s - 1))} className="w-12 h-12 rounded-full border border-gray-200 text-2xl">－</button>
              <span className="text-4xl font-black">{localServings}<span className="text-sm ml-1 font-normal text-gray-400">人</span></span>
              <button onClick={() => setLocalServings(s => s + 1)} className="w-12 h-12 rounded-full border border-blue-600 text-blue-600 text-2xl">＋</button>
            </div>
            <button onClick={() => setServingsModalOpen(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200">套用調整</button>
            <button onClick={() => { setLocalServings(recipe.servings); setServingsModalOpen(false); }} className="w-full mt-4 text-gray-400 font-bold">取消</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Profile Page ---
const ProfilePage: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-8">個人中心</h2>
    <div className="flex items-center gap-4 mb-8"><div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl"><i className="fa-solid fa-user"></i></div><div><h3 className="text-xl font-bold">主廚之路</h3><p className="text-sm text-gray-400">已解鎖 12 道食譜</p></div></div>
    <div className="space-y-4">{['我的最愛', '烹飪紀錄', '過敏原與偏好', '關於 AI Smart Chef'].map(label => (<button key={label} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"><span className="font-medium text-gray-700">{label}</span><i className="fa-solid fa-chevron-right text-gray-300"></i></button>))}</div>
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
    if (stored) { try { const parsed = JSON.parse(stored); if (parsed.displayName) setShowOnboarding(false); else setShowOnboarding(true); } catch (e) { setShowOnboarding(true); } }
    else setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => { localStorage.setItem('user_profile_v1', JSON.stringify(profile)); setShowOnboarding(false); };

  // 任務：Seed 食譜點擊後進入二段式 AI 生成
  const handleRecipeSelection = async (recipe: Recipe | SeedRecipe) => {
    if (recipe.source === 'seed') {
      const seed = recipe as SeedRecipe;
      setLastClickedSeed(seed);
      setGenerationError(null);
      setIsGenerating(true);

      console.log("[Seed Input]", { id: seed.recipe_id, title: seed.title, cat: seed.category });
      console.log("[Ingredients Payload]", seed.seed_ingredients);

      try {
        const storedProfile = localStorage.getItem('user_profile_v1');
        const profile: UserProfile = storedProfile ? JSON.parse(storedProfile) : INITIAL_USER_PROFILE;

        const constraints: UserConstraints = {
          allergies: profile.allergies,
          dietary_rules: profile.dietaryRules,
          equipment: profile.equipment,
          detail_level: profile.detailLevel,
          servings: seed.servings,
          preferred_categories: [seed.category],
          user_free_text: `此為「${seed.title}」食譜基底。描述：${seed.short_description}。請以此為核心生成 3-5 個不同口味或層次的細節食譜。
          請特別注意：在 ingredients.name 前加上【預備】/【輔料】/【調味】標籤，例如：【預備】雞肉、【調味】食鹽。`
        };

        const result = await generateRecipes(seed.seed_ingredients, constraints);
        console.log("[AI Result Count]", result.recipes?.length);
        
        if (result.recipes && result.recipes.length > 0) {
          // 標記為 AI 生成並對應到 Seed
          const aiCandidates = result.recipes.map(r => ({ ...r, source: 'ai' as const, category: seed.category }));
          setCandidates(aiCandidates);
          setActiveTab('home'); // 切換回首頁視窗以顯示 Candidates View
        } else {
          throw new Error("AI 無法針對此食材基底生成候選提案。");
        }
      } catch (e: any) {
        console.error("[AI Generation Error]", e);
        setGenerationError(`錯誤代碼: ${e.status || '500'}\n訊息: ${e.message || "未知伺服器異常"}`);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setSelectedRecipe(recipe as Recipe);
    }
  };

  const handleCameraConfirm = async (ingredients: string[]) => {
    setIsGenerating(true); setActiveTab('home'); setGenerationError(null);
    try {
      const result = await generateRecipes(ingredients, INITIAL_USER_PROFILE);
      setCandidates(result.recipes);
    } catch (e: any) { setGenerationError(`掃描識別失敗: ${e.message}`); }
    finally { setIsGenerating(false); }
  };

  const renderContent = () => {
    if (selectedRecipe) return <RecipeDetailPage recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
    
    if (generationError) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6"><i className="fa-solid fa-triangle-exclamation"></i></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">研製過程出錯</h2>
        <pre className="text-gray-400 text-xs mb-8 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl text-left">{generationError}</pre>
        <div className="flex gap-4 w-full">
          <button onClick={() => setGenerationError(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">返回</button>
          <button onClick={() => lastClickedSeed && handleRecipeSelection(lastClickedSeed)} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">重新嘗試</button>
        </div>
      </div>
    );

    if (isGenerating) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold mb-2">AI 主廚研製中...</h2>
        <p className="text-gray-500 text-sm">正在分析口味、規劃步驟並進行食材分組標註</p>
      </div>
    );

    if (activeCategory) return <CategoryListPage category={activeCategory} onBack={() => setActiveCategory(null)} onSelectRecipe={handleRecipeSelection} />;

    switch (activeTab) {
      case 'camera': return <CameraPage onConfirm={handleCameraConfirm} />;
      case 'home':
        if (candidates.length > 0) return (
          <div>
            <div className="p-4 flex items-center gap-2"><button onClick={() => setCandidates([])} className="text-blue-500 font-bold text-sm"><i className="fa-solid fa-chevron-left mr-1"></i> 返回首頁</button></div>
            <CandidatePage recipes={candidates} onSelect={setSelectedRecipe} />
          </div>
        );
        return <HomePage onSelectRecipe={handleRecipeSelection} onSeeMore={setActiveCategory} />;
      case 'profile': return <ProfilePage />;
      default: return null;
    }
  };

  if (showOnboarding === null) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (showOnboarding) return <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg"><OnboardingPage onComplete={handleOnboardingComplete} /></div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</main>
      {!selectedRecipe && activeTab !== 'camera' && !isGenerating && !activeCategory && !generationError && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur border-t border-gray-100 flex justify-around py-4 z-50 rounded-t-3xl shadow-2xl">
          <button onClick={() => {setActiveTab('home'); setCandidates([]);}} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}><i className="fa-solid fa-house-chimney text-xl"></i><span className="text-[10px] font-bold">探索</span></button>
          <button onClick={() => setActiveTab('camera')} className="flex flex-col items-center gap-1 -mt-10"><div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"><i className="fa-solid fa-camera text-2xl"></i></div></button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}><i className="fa-solid fa-user text-xl"></i><span className="text-[10px] font-bold">個人</span></button>
        </nav>
      )}
    </div>
  );
}
