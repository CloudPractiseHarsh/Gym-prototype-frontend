import React, { useState, useEffect } from 'react';
import { 
  User, Plus, MessageCircle, BarChart3, Target, Utensils, Calendar, 
  Settings, LogOut, Send, Trash2, Search, TrendingUp, Award, 
  Zap, Clock, ChevronRight, ChevronDown, RefreshCw, Bell,
  Home, Activity, BookOpen, Heart
} from 'lucide-react';
import '../src/index.css'
const API_BASE = 'http://127.0.0.1:8000';

const GymNutritionTracker = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyTips, setDailyTips] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [expandedMeal, setExpandedMeal] = useState(null);

  // Auth states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', email: '', password: '', weight: '', height: '', age: '',
    activity_level: 'moderate', goal: 'maintain'
  });
  const [isRegistering, setIsRegistering] = useState(false);

  // Nutrition form state
  const [nutritionForm, setNutritionForm] = useState({
    food_name: '', calories: '', protein: '', carbs: '', fat: '',
    serving_size: '', meal_type: 'breakfast'
  });

  // Food search
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchNutritionLogs();
      fetchDailySummary();
      fetchDailyTips();
    }
  }, [token]);

  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      setCurrentView('dashboard');
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiCall('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          ...registerForm,
          weight: parseFloat(registerForm.weight),
          height: parseFloat(registerForm.height),
          age: parseInt(registerForm.age)
        })
      });
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      setCurrentView('dashboard');
    } catch (error) {
      alert('Registration failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('dashboard');
  };

  const fetchUserProfile = async () => {
    try {
      const data = await apiCall('/api/profile');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchNutritionLogs = async () => {
    try {
      const data = await apiCall('/api/nutrition/logs');
      setNutritionLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const data = await apiCall('/api/nutrition/summary');
      setDailySummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchDailyTips = async () => {
    try {
      const data = await apiCall('/api/nutrition/daily-tips');
      setDailyTips(data.daily_tips);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    }
  };

  const fetchFoodSuggestions = async (criteria) => {
    try {
      const params = new URLSearchParams(criteria);
      const data = await apiCall(`/nutrition/food-suggestions?${params}`);
      setFoodSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const logNutrition = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiCall('/api/nutrition/log', {
        method: 'POST',
        body: JSON.stringify({
          ...nutritionForm,
          calories: parseFloat(nutritionForm.calories),
          protein: parseFloat(nutritionForm.protein),
          carbs: parseFloat(nutritionForm.carbs),
          fat: parseFloat(nutritionForm.fat)
        })
      });
      setNutritionForm({
        food_name: '', calories: '', protein: '', carbs: '', fat: '',
        serving_size: '', meal_type: 'breakfast'
      });
      fetchNutritionLogs();
      fetchDailySummary();
      setCurrentView('dashboard');
    } catch (error) {
      alert('Failed to log nutrition: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await apiCall('/api/chat/nutrition', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage })
      });
      setChatMessages(prev => [...prev, { type: 'assistant', content: data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'error', content: 'Failed to get response' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAddFoods = [
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Brown Rice (100g)', calories: 123, protein: 2.6, carbs: 23, fat: 0.9 },
    { name: 'Banana (medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Greek Yogurt (100g)', calories: 100, protein: 10, carbs: 6, fat: 5 },
    { name: 'Almonds (30g)', calories: 174, protein: 6.3, carbs: 6.6, fat: 15 },
    { name: 'Sweet Potato (100g)', calories: 90, protein: 2, carbs: 21, fat: 0.1 },
  ];

  const ProgressCircle = ({ percentage, size = 80, strokeWidth = 8, color = 'blue' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`text-${color}-500 transition-all duration-500`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ current, goal, label, color = 'blue', showPercentage = true }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-600">
            {current.toFixed(1)} / {goal.toFixed(1)}
            {showPercentage && ` (${percentage.toFixed(0)}%)`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-${color}-400 to-${color}-600`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-pb">
      <div className="flex justify-around max-w-md mx-auto">
        {[
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'log', icon: Plus, label: 'Log' },
          { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              currentView === id 
                ? 'text-blue-600 bg-blue-50 scale-105 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Gym Nutrition
            </h1>
            <p className="text-gray-600 mt-2">Track your nutrition with AI assistance</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-3 text-center rounded-lg transition-all duration-200 font-medium ${
                !isRegistering 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-3 text-center rounded-lg transition-all duration-200 font-medium ${
                isRegistering 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Register
            </button>
          </div>

          {!isRegistering ? (
            <form onSubmit={login} className="space-y-4">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={register} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={registerForm.weight}
                  onChange={(e) => setRegisterForm({...registerForm, weight: e.target.value})}
                  className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center"
                  required
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={registerForm.height}
                  onChange={(e) => setRegisterForm({...registerForm, height: e.target.value})}
                  className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center"
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={registerForm.age}
                  onChange={(e) => setRegisterForm({...registerForm, age: e.target.value})}
                  className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center"
                  required
                />
              </div>
              
              <select
                value={registerForm.activity_level}
                onChange={(e) => setRegisterForm({...registerForm, activity_level: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="sedentary">Sedentary (Desk job, no exercise)</option>
                <option value="light">Light (Light exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="active">Very Active (Exercise 6-7 days/week)</option>
                <option value="extra">Extra Active (Physical job + exercise)</option>
              </select>
              
              <select
                value={registerForm.goal}
                onChange={(e) => setRegisterForm({...registerForm, goal: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="lose_weight">🔥 Lose Weight</option>
                <option value="maintain">⚖️ Maintain Weight</option>
                <option value="gain_muscle">💪 Gain Muscle</option>
              </select>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {currentView === 'dashboard' && '🏠 Dashboard'}
              {currentView === 'log' && '➕ Log Food'}
              {currentView === 'chat' && '🤖 AI Assistant'}
              {currentView === 'profile' && '👤 Profile'}
            </h1>
            {user && (
              <p className="text-sm text-gray-600">
                Goal: {user.goal.replace('_', ' ')} • {user.weight}kg
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Daily Progress Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Today's Progress
                </h2>
                <button
                  onClick={fetchDailySummary}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              {dailySummary ? (
                <div className="space-y-6">
                  {/* Circular Progress for Calories */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <ProgressCircle 
                        percentage={(dailySummary.daily_totals.calories / dailySummary.daily_goals.calories) * 100}
                        size={120}
                        color="blue"
                      />
                      <div className="text-center mt-3">
                        <p className="text-sm font-medium text-gray-600">Calories</p>
                        <p className="text-lg font-bold text-gray-800">
                          {dailySummary.daily_totals.calories.toFixed(0)} / {dailySummary.daily_goals.calories.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Macro Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {dailySummary.daily_totals.protein.toFixed(0)}g
                      </div>
                      <div className="text-sm text-green-700 font-medium">Protein</div>
                      <div className="text-xs text-green-600">
                        {((dailySummary.daily_totals.protein / dailySummary.daily_goals.protein) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-600">
                        {dailySummary.daily_totals.carbs.toFixed(0)}g
                      </div>
                      <div className="text-sm text-yellow-700 font-medium">Carbs</div>
                      <div className="text-xs text-yellow-600">
                        {((dailySummary.daily_totals.carbs / dailySummary.daily_goals.carbs) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <div className="text-2xl font-bold text-red-600">
                        {dailySummary.daily_totals.fat.toFixed(0)}g
                      </div>
                      <div className="text-sm text-red-700 font-medium">Fat</div>
                      <div className="text-xs text-red-600">
                        {((dailySummary.daily_totals.fat / dailySummary.daily_goals.fat) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Remaining Calories */}
                  {dailySummary.remaining.calories > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="font-medium text-blue-800">
                            {dailySummary.remaining.calories.toFixed(0)} calories remaining
                          </p>
                          <p className="text-sm text-blue-600">
                            You can eat {dailySummary.remaining.protein.toFixed(0)}g more protein
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">No nutrition data logged today</p>
                  <button
                    onClick={() => setCurrentView('log')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Log your first meal
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {dailySummary && (
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  icon={Activity}
                  title="Calories"
                  value={dailySummary.daily_totals.calories.toFixed(0)}
                  subtitle="kcal today"
                  color="blue"
                />
                <StatsCard
                  icon={Heart}
                  title="Protein"
                  value={`${dailySummary.daily_totals.protein.toFixed(0)}g`}
                  subtitle="of daily goal"
                  color="green"
                />
              </div>
            )}

            {/* Recent Meals */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Recent Meals
              </h2>
              {nutritionLogs.length > 0 ? (
                <div className="space-y-3">
                  {nutritionLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">{log.food_name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                              {log.calories}cal
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                              {log.protein}g protein
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg capitalize">
                              {log.meal_type}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {nutritionLogs.length > 3 && (
                    <button
                      onClick={() => setExpandedMeal(!expandedMeal)}
                      className="w-full text-center py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {expandedMeal ? 'Show Less' : `View ${nutritionLogs.length - 3} More`}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${expandedMeal ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  
                  {expandedMeal && nutritionLogs.slice(3).map((log) => (
                    <div key={log.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">{log.food_name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                              {log.calories}cal
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                              {log.protein}g protein
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg capitalize">
                              {log.meal_type}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">No meals logged yet</p>
                </div>
              )}
            </div>

            {/* Daily Tips */}
            {dailyTips && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-600" />
                  Daily Tips
                </h2>
                <p className="text-gray-700 leading-relaxed">{dailyTips}</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'log' && (
          <div className="space-y-6">
            {/* Quick Add Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Quick Add</h2>
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showQuickAdd ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showQuickAdd && (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {quickAddFoods.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setNutritionForm({
                          food_name: food.name,
                          calories: food.calories.toString(),
                          protein: food.protein.toString(),
                          carbs: food.carbs.toString(),
                          fat: food.fat.toString(),
                          serving_size: '1 serving',
                          meal_type: nutritionForm.meal_type
                        });
                        setShowQuickAdd(false);
                      }}
                      className="text-left p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <div className="font-medium text-gray-800">{food.name}</div>
                      <div className="text-sm text-gray-600">
                        {food.calories}cal • {food.protein}g protein
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Entry Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Log Nutrition
              </h2>
              
              <form onSubmit={logNutrition} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Grilled Chicken Breast"
                    value={nutritionForm.food_name}
                    onChange={(e) => setNutritionForm({...nutritionForm, food_name: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="165"
                      value={nutritionForm.calories}
                      onChange={(e) => setNutritionForm({...nutritionForm, calories: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="31"
                      value={nutritionForm.protein}
                      onChange={(e) => setNutritionForm({...nutritionForm, protein: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={nutritionForm.carbs}
                      onChange={(e) => setNutritionForm({...nutritionForm, carbs: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="3.6"
                      value={nutritionForm.fat}
                      onChange={(e) => setNutritionForm({...nutritionForm, fat: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serving Size</label>
                  <input
                    type="text"
                    placeholder="100g, 1 cup, 1 piece"
                    value={nutritionForm.serving_size}
                    onChange={(e) => setNutritionForm({...nutritionForm, serving_size: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                  <select
                    value={nutritionForm.meal_type}
                    onChange={(e) => setNutritionForm({...nutritionForm, meal_type: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">🌞 Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snack">🥜 Snack</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Logging Food...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Log Food
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'chat' && (
          <div className="bg-white rounded-2xl shadow-sm h-96 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                AI Nutrition Assistant
              </h2>
              <p className="text-sm text-gray-600">Get personalized nutrition advice</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">Start chatting with your AI nutrition assistant!</p>
                  <div className="space-y-2 text-left bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Try asking:</p>
                    {[
                      "How much protein should I eat?",
                      "Best foods for muscle gain?",
                      "What should I eat pre-workout?",
                      "How to lose weight safely?"
                    ].map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInput(question);
                          setTimeout(() => sendChatMessage(), 100);
                        }}
                        className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                      >
                        "• {question}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        msg.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                          : msg.type === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Ask about nutrition, diet, workouts..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isLoading}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'profile' && user && (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.username}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{user.weight} kg</div>
                  <div className="text-sm text-blue-700 font-medium">Weight</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 mb-1">{user.height} cm</div>
                  <div className="text-sm text-green-700 font-medium">Height</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-800 mb-1">{user.age}</div>
                  <div className="text-sm text-gray-600">Years Old</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-800 mb-1 capitalize">
                    {user.activity_level}
                  </div>
                  <div className="text-sm text-gray-600">Activity</div>
                </div>
              </div>
            </div>

            {/* Goal Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Current Goal
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 mb-1 capitalize">
                    {user.goal.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-purple-700">
                    {user.goal === 'lose_weight' && '🔥 Focus on caloric deficit'}
                    {user.goal === 'gain_muscle' && '💪 Focus on protein & surplus'}
                    {user.goal === 'maintain' && '⚖️ Focus on balanced nutrition'}
                  </div>
                </div>
                <div className="text-4xl">
                  {user.goal === 'lose_weight' && '🔥'}
                  {user.goal === 'gain_muscle' && '💪'}
                  {user.goal === 'maintain' && '⚖️'}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => fetchFoodSuggestions({high_protein: true})}
                  className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Utensils className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">High Protein Foods</div>
                      <div className="text-sm text-gray-600">Get food suggestions</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => setCurrentView('chat')}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">Ask AI Assistant</div>
                      <div className="text-sm text-gray-600">Get nutrition advice</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => {
                    fetchDailySummary();
                    setCurrentView('dashboard');
                  }}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">View Progress</div>
                      <div className="text-sm text-gray-600">Check daily summary</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Food Suggestions Display */}
            {foodSuggestions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Food Suggestions</h3>
                <div className="space-y-3">
                  {foodSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setFoodSuggestions([])}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 text-center"
                >
                  Hide Suggestions
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default GymNutritionTracker;