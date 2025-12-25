
import React, { useState, useEffect } from 'react';
import { Category, Recipe, UserProfile, DetailLevel, GeminiRecipeResponse } from './types';
import { INITIAL_USER_PROFILE, APP_CATEGORIES } from './constants';
import { InfoIcon } from './components/InfoIcon';
import { RecipeCard } from './components/RecipeCard';
import { generateRecipes } from './geminiService';

// --- Onboarding Page ---
const OnboardingPage: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  // Fixed: Added optInCloud and used DetailLevel.DETAILED to match updated UserProfile interface
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

// --- Sub-pages ---
// 1. Home Page
const HomePage: React.FC<{ onSelectRecipe: (r: Recipe) => void }> = ({ onSelectRecipe }) => {
  const [sortBy, setSortBy] = useState('綜合');
  
  // Mock Top 5 data
  const top5Recipes: Recipe[] = [
    { recipe_id: 'seed-1', title: '日式黃金咖哩飯', category: Category.RICE, short_description: '濃郁咖哩香氣，經典家常料理。', servings: 2, total_time_minutes: 40, calories_estimate_kcal: 750, calories_confidence: 'estimate', equipment_needed: ['電鍋'], ingredients: [], missing_or_substitutions: [], steps: [], safety_notes: [], tags: [], rating: 4.8, review_count: 125, source: 'seed' },
    { recipe_id: 'seed-2', title: '清燉番茄牛肉麵', category: Category.NOODLES, short_description: '番茄清甜與軟嫩牛肉的完美結合。', servings: 2, total_time_minutes: 90, calories_estimate_kcal: 620, calories_confidence: 'estimate', equipment_needed: ['燉鍋'], ingredients: [], missing_or_substitutions: [], steps: [], safety_notes: [], tags: [], rating: 4.9, review_count: 89, source: 'seed' },
    { recipe_id: 'seed-3', title: '蒜香蛤蜊雞湯', category: Category.SOUP, short_description: '鮮甜海味，暖心補身首選。', servings: 4, total_time_minutes: 50, calories_estimate_kcal: 350, calories_confidence: 'estimate', equipment_needed: ['湯鍋'], ingredients: [], missing_or_substitutions: [], steps: [], safety_notes: [], tags: [], rating: 4.7, review_count: 56, source: 'seed' },
  ];

  return (
    <div className="pb-24">
      {/* Top Banner Ranking */}
      <div className="px-4 py-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">熱門排行榜 (Top 5)</h2>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-lg px-2 py-1 outline-none"
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
              <div className="absolute -top-2 -left-2 z-10 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                {idx + 1}
              </div>
              <RecipeCard recipe={recipe} onClick={onSelectRecipe} />
            </div>
          ))}
        </div>
      </div>

      {/* Categorized Recommendations */}
      {APP_CATEGORIES.map(cat => (
        <section key={cat} className="mt-8 px-4">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-800">{cat}推薦</h3>
            <button className="text-blue-500 text-sm font-medium">查看更多 <i className="fa-solid fa-chevron-right ml-1"></i></button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
            {/* Mock horizontal cards */}
            {[1, 2, 3].map(i => (
              <RecipeCard 
                key={`${cat}-${i}`}
                recipe={{
                  recipe_id: `mock-${cat}-${i}`,
                  title: `${cat}特色料理 ${i}`,
                  category: cat,
                  short_description: `這是一道非常受歡迎的${cat}料理，簡單好做。`,
                  servings: 2,
                  total_time_minutes: 25 + i * 5,
                  calories_estimate_kcal: 400 + i * 50,
                  calories_confidence: 'estimate',
                  equipment_needed: [],
                  ingredients: [],
                  missing_or_substitutions: [],
                  steps: [],
                  safety_notes: [],
                  tags: [],
                  source: 'ai'
                }}
                onClick={onSelectRecipe}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

// 2. Camera & Ingredient Input Flow
const CameraPage: React.FC<{ onConfirm: (ing: string[]) => void }> = ({ onConfirm }) => {
  const [step, setStep] = useState<'camera' | 'confirm'>('camera');
  const [ingredients, setIngredients] = useState<string[]>(['雞蛋', '豬肉', '洋蔥']);
  const [newIng, setNewIng] = useState('');
  const [mode, setMode] = useState<'table' | 'fridge'>('table');

  if (step === 'camera') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        <div className="relative flex-1 bg-gray-900 overflow-hidden flex items-center justify-center">
          <img src="https://picsum.photos/seed/camera/800/1200" className="w-full h-full object-cover opacity-80" alt="camera view" />
          <div className="absolute top-10 right-4">
            <InfoIcon title="拍照說明" content="請將相機對準食材，確保光線充足且食材沒有被遮擋。支援一次拍攝多種食材，或切換至冰箱模式進行辨識。" />
          </div>
          
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6">
            <div className="flex bg-white/20 backdrop-blur rounded-full p-1">
              <button 
                onClick={() => setMode('table')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${mode === 'table' ? 'bg-white text-gray-900' : 'text-white'}`}
              >桌上食材</button>
              <button 
                onClick={() => setMode('fridge')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${mode === 'fridge' ? 'bg-white text-gray-900' : 'text-white'}`}
              >冰箱模式</button>
            </div>
            
            <div className="flex items-center gap-12">
              <button className="text-white text-2xl"><i className="fa-regular fa-image"></i></button>
              <button 
                onClick={() => setStep('confirm')}
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 active:scale-95 transition-transform"
              ></button>
              <button className="text-white text-2xl"><i className="fa-solid fa-bolt"></i></button>
            </div>
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
        <button onClick={() => onConfirm(ingredients)} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">生成食譜</button>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">辨識結果</label>
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ing => (
              <div key={ing} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                {ing}
                <button onClick={() => setIngredients(prev => prev.filter(x => x !== ing))} className="text-blue-300 hover:text-blue-500">
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            ))}
            <button onClick={() => setStep('camera')} className="border-2 border-dashed border-gray-200 text-gray-400 px-3 py-1 rounded-full text-sm">
              <i className="fa-solid fa-plus mr-1"></i> 再拍一張
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">手動新增 / 語音修正</label>
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
            <button className="bg-gray-100 text-gray-600 px-4 rounded-xl">
              <i className="fa-solid fa-microphone"></i>
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">常用食材快捷鍵</label>
          <div className="flex flex-wrap gap-2">
            {['洋蔥', '大蒜', '青蔥', '生薑', '奶油', '橄欖油'].map(common => (
              <button 
                key={common}
                onClick={() => !ingredients.includes(common) && setIngredients(prev => [...prev, common])}
                className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm border border-gray-100"
              >
                {common}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Recipe Candidate Page
const CandidatePage: React.FC<{ recipes: Recipe[], onSelect: (r: Recipe) => void }> = ({ recipes, onSelect }) => {
  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-2">為您生成了 {recipes.length} 個提案</h2>
      <p className="text-gray-500 mb-6 text-sm">根據您的食材與器材，我們推薦以下料理方式：</p>
      
      <div className="grid grid-cols-1 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.recipe_id} onClick={() => onSelect(recipe)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-32 cursor-pointer">
            <div className="w-32 bg-gray-200">
              <img src={`https://picsum.photos/seed/${recipe.recipe_id}/200/200`} className="w-full h-full object-cover" alt={recipe.title} />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{recipe.title}</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold">{recipe.category}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{recipe.short_description}</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500">
                <span><i className="fa-regular fa-clock mr-1"></i>{recipe.total_time_minutes} 分鐘</span>
                <span><i className="fa-solid fa-fire-flame-curved mr-1"></i>{recipe.calories_estimate_kcal} kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Recipe Detail & Chef Mode
const RecipeDetailPage: React.FC<{ recipe: Recipe, onBack: () => void }> = ({ recipe, onBack }) => {
  const [isChefMode, setIsChefMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [servings, setServings] = useState(recipe.servings);
  const [timer, setTimer] = useState<number | null>(null);

  const updateServings = (delta: number) => {
    setServings(prev => Math.max(1, prev + delta));
  };

  const startTimer = (seconds: number) => {
    setTimer(seconds);
  };

  useEffect(() => {
    let interval: any;
    if (timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
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
          <h3 className="font-bold text-blue-600 uppercase tracking-widest text-xs">烹飪模式 (Step {currentStep + 1}/{recipe.steps.length})</h3>
          <button onClick={() => setIsChefMode(false)} className="text-gray-400"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>
        
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <h4 className="text-2xl font-bold mb-4">{step.title}</h4>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">{step.text}</p>
          
          {step.timer_seconds !== null && (
            <div className="mb-8">
              {timer !== null ? (
                <div className="text-6xl font-black text-blue-600 mb-4 tabular-nums">
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </div>
              ) : (
                <button 
                  onClick={() => startTimer(step.timer_seconds!)}
                  className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-colors"
                >
                  <i className="fa-solid fa-hourglass-start mr-2"></i> 開始計時 ({step.timer_seconds}秒)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-4">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500 disabled:opacity-50"
          >上一步</button>
          <button 
            onClick={() => {
              if (currentStep === recipe.steps.length - 1) {
                setIsChefMode(false);
                alert("恭喜完成烹飪！");
              } else {
                setCurrentStep(prev => prev + 1);
                setTimer(null);
              }
            }}
            className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg"
          >
            {currentStep === recipe.steps.length - 1 ? '完成烹飪' : '下一步'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="relative h-64 bg-gray-200">
        <img src={`https://picsum.photos/seed/${recipe.recipe_id}/800/600`} className="w-full h-full object-cover" alt={recipe.title} />
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-gray-800">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button 
          onClick={() => setIsChefMode(true)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur text-blue-600 px-4 py-2 rounded-full font-bold text-sm shadow-sm"
        >
          <i className="fa-solid fa-utensils mr-2"></i> 烹飪模式
        </button>
      </div>

      <div className="px-6 py-8 -mt-8 bg-white rounded-t-[32px] relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{recipe.category}</span>
          <div className="flex text-yellow-400 text-xs">
            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i>
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-4">{recipe.title}</h1>
        
        {/* Summary Info */}
        <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50 rounded-2xl p-4">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">時間</p>
            <p className="text-sm font-bold text-gray-800">{recipe.total_time_minutes}m</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">份量</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold text-gray-800">{servings}人</span>
              <button onClick={() => updateServings(1)} className="text-[10px] text-blue-500"><i className="fa-solid fa-gear"></i></button>
            </div>
          </div>
          <div className="text-center border-r border-gray-200 px-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">器材</p>
            <p className="text-[10px] font-bold text-gray-800 line-clamp-1">{recipe.equipment_needed[0] || '不限'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">熱量</p>
            <p className="text-sm font-bold text-orange-500">{recipe.calories_estimate_kcal}k</p>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">準備食材</h3>
            <span className="text-xs text-gray-400">比例隨人數自動調整</span>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.length > 0 ? recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">{ing.name} {ing.optional && <span className="text-[10px] text-gray-300 font-bold">(可選)</span>}</span>
                <span className="font-bold text-gray-800">{ing.amount}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-sm">點擊按鈕獲取食材細節</p>
            )}
          </div>
        </div>

        {/* Missing/Substitutions */}
        {recipe.missing_or_substitutions.length > 0 && (
          <div className="mb-8 bg-orange-50 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-orange-800 mb-2"><i className="fa-solid fa-circle-exclamation mr-2"></i>缺少食材替代建議</h4>
            <div className="space-y-2">
              {recipe.missing_or_substitutions.map((sub, idx) => (
                <div key={idx} className="text-xs text-orange-700">
                  <span className="font-bold">缺 {sub.missing}：</span>{sub.substitute}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">烹飪步驟</h3>
          <div className="space-y-6">
            {recipe.steps.length > 0 ? recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
                  {step.timer_seconds && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500">
                      <i className="fa-solid fa-stopwatch"></i> 需要計時: {step.timer_seconds}s
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-sm">載入步驟中...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Profile Page
const ProfilePage: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">個人中心</h2>
        <button className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-gear text-xl"></i></button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl">
          <i className="fa-solid fa-user"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold">廚藝大師</h3>
          <p className="text-sm text-gray-400">已生成 24 道私房食譜</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { icon: 'fa-heart', label: '我的最愛', count: 12 },
          { icon: 'fa-history', label: '烹飪歷史', count: 48 },
          { icon: 'fa-sliders', label: '詳細偏好設定', count: null },
          { icon: 'fa-share-nodes', label: '雲端同步 (Opt-in)', count: 'OFF' },
        ].map((item, idx) => (
          <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <i className={`fa-solid ${item.icon} text-gray-400`}></i>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count !== null && <span className="text-sm text-gray-400">{item.count}</span>}
              <i className="fa-solid fa-chevron-right text-[10px] text-gray-300"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main App Controller ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'camera' | 'profile'>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [candidates, setCandidates] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage for existing profile
    const stored = localStorage.getItem('user_profile_v1');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.displayName) {
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (e) {
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem('user_profile_v1', JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const handleCameraConfirm = async (ingredients: string[]) => {
    setIsGenerating(true);
    setActiveTab('home'); // Go back to main container view
    try {
      const result = await generateRecipes(ingredients, INITIAL_USER_PROFILE);
      setCandidates(result.recipes);
      // Automatically show candidates if any
    } catch (error) {
      console.error(error);
      alert("生成失敗，請稍後再試。");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (selectedRecipe) {
      return <RecipeDetailPage recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
    }

    if (activeTab === 'camera') {
      return <CameraPage onConfirm={handleCameraConfirm} />;
    }

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold mb-2">正在為您構思食譜...</h2>
          <p className="text-gray-500 text-sm">正在分析食材、比對您的飲食禁忌並設計烹飪步驟</p>
        </div>
      );
    }

    if (candidates.length > 0 && activeTab === 'home') {
      return (
        <div>
          <div className="px-4 pt-4 flex justify-between items-center">
             <button onClick={() => setCandidates([])} className="text-xs text-blue-500 font-bold">← 返回首頁推薦</button>
          </div>
          <CandidatePage recipes={candidates} onSelect={setSelectedRecipe} />
        </div>
      );
    }

    switch (activeTab) {
      case 'home': return <HomePage onSelectRecipe={setSelectedRecipe} />;
      case 'profile': return <ProfilePage />;
      default: return null;
    }
  };

  if (showOnboarding === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <OnboardingPage onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative flex flex-col">
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Nav */}
      {!selectedRecipe && activeTab !== 'camera' && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-3 px-6 z-50">
          <button 
            onClick={() => { setActiveTab('home'); setCandidates([]); }}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <i className="fa-solid fa-house-chimney text-xl"></i>
            <span className="text-[10px] font-bold">主頁</span>
          </button>
          <button 
            onClick={() => setActiveTab('camera')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'camera' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white -mt-8 shadow-lg shadow-blue-200">
              <i className="fa-solid fa-camera text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">掃描</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <i className="fa-solid fa-user text-xl"></i>
            <span className="text-[10px] font-bold">個人</span>
          </button>
        </nav>
      )}
    </div>
  );
}
