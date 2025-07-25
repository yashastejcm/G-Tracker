import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Dumbbell, Calendar, Target, TrendingUp, Image as ImageIcon, CheckCircle, XCircle, Clock, Plus, Trash2, Edit, Save, BarChart2, Search, Undo, Lock, LayoutGrid, User, Camera, Flame, Minus, ChevronLeft, ChevronRight, Barcode, AlertTriangle } from 'lucide-react';

// --- Custom Hook for loading external scripts ---
const useScript = (url) => {
  const [status, setStatus] = useState(url ? "loading" : "idle");

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

    let script = document.querySelector(`script[src="${url}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      const setAttributeFromEvent = (event) => {
        script.setAttribute("data-status", event.type === "load" ? "ready" : "error");
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    }

    const setStateFromEvent = (event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    if (script.readyState === 'complete' || script.readyState === 'loaded') {
        setStatus('ready');
    } else {
        script.addEventListener("load", setStateFromEvent);
        script.addEventListener("error", setStateFromEvent);
    }
    

    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);
      }
    };
  }, [url]);

  return status;
};


// --- Local Storage Helper Functions ---
const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: 'workout_user_profile',
  WORKOUT_PLAN: 'workout_plan',
  LOGS: 'workout_logs',
  EXERCISE_PROGRESS: 'exercise_progress',
  EXERCISE_MEDIA: 'exercise_media',
  CALORIE_LOGS: 'calorie_logs',
  CUSTOM_FOOD_LIST: 'workout_custom_food_list'
};

const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return null;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Predefined Data ---
const EXERCISE_LIST = [
    { "name": "Barbell Bench Press", "muscle": "Chest", "type": "Compound" },
    { "name": "Incline Dumbbell Press", "muscle": "Chest", "type": "Compound" },
    { "name": "Push-ups", "muscle": "Chest", "type": "Compound" },
    { "name": "Dumbbell Flyes", "muscle": "Chest", "type": "Isolation" },
    { "name": "Cable Crossovers", "muscle": "Chest", "type": "Isolation" },
    { "name": "Chest Dips", "muscle": "Chest", "type": "Compound" },
    { "name": "Pull-ups", "muscle": "Back", "type": "Compound" },
    { "name": "Lat Pulldown", "muscle": "Back", "type": "Compound" },
    { "name": "Bent-Over Barbell Row", "muscle": "Back", "type": "Compound" },
    { "name": "Seated Cable Row", "muscle": "Back", "type": "Compound" },
    { "name": "Dumbbell Shrugs", "muscle": "Back", "type": "Isolation" },
    { "name": "Face Pulls", "muscle": "Back", "type": "Isolation" },
    { "name": "Overhead Barbell Press", "muscle": "Shoulder", "type": "Compound" },
    { "name": "Dumbbell Shoulder Press", "muscle": "Shoulder", "type": "Compound" },
    { "name": "Lateral Raises", "muscle": "Shoulder", "type": "Isolation" },
    { "name": "Front Raises", "muscle": "Shoulder", "type": "Isolation" },
    { "name": "Reverse Pec Deck Fly", "muscle": "Shoulder", "type": "Isolation" },
    { "name": "Arnold Press", "muscle": "Shoulder", "type": "Compound" },
    { "name": "Barbell Curl", "muscle": "Arm", "type": "Isolation" },
    { "name": "Dumbbell Curl", "muscle": "Arm", "type": "Isolation" },
    { "name": "Preacher Curl", "muscle": "Arm", "type": "Isolation" },
    { "name": "Concentration Curl", "muscle": "Arm", "type": "Isolation" },
    { "name": "Hammer Curl", "muscle": "Arm", "type": "Isolation" },
    { "name": "Cable Curl", "muscle": "Arm", "type": "Isolation" },
    { "name": "Close-Grip Bench Press", "muscle": "Arm", "type": "Compound" },
    { "name": "Skull Crushers", "muscle": "Arm", "type": "Isolation" },
    { "name": "Triceps Pushdown", "muscle": "Arm", "type": "Isolation" },
    { "name": "Overhead Dumbbell Extension", "muscle": "Arm", "type": "Isolation" },
    { "name": "Dips", "muscle": "Arm", "type": "Compound" },
    { "name": "Barbell Back Squat", "muscle": "Leg", "type": "Compound" },
    { "name": "Leg Press", "muscle": "Leg", "type": "Compound" },
    { "name": "Lunges", "muscle": "Leg", "type": "Compound" },
    { "name": "Leg Curl", "muscle": "Leg", "type": "Isolation" },
    { "name": "Leg Extension", "muscle": "Leg", "type": "Isolation" },
    { "name": "Romanian Deadlift", "muscle": "Leg", "type": "Compound" },
    { "name": "Standing Calf Raise", "muscle": "Leg", "type": "Isolation" },
    { "name": "Hip Thrust", "muscle": "Butt", "type": "Compound" },
    { "name": "Glute Kickback", "muscle": "Butt", "type": "Isolation" },
    { "name": "Bulgarian Split Squat", "muscle": "Butt", "type": "Compound" },
    { "name": "Plank", "muscle": "Abs", "type": "Isolation" },
    { "name": "Crunches", "muscle": "Abs", "type": "Isolation" },
    { "name": "Hanging Leg Raises", "muscle": "Abs", "type": "Isolation" },
    { "name": "Russian Twists", "muscle": "Abs", "type": "Isolation" },
    { "name": "Bicycle Crunch", "muscle": "Abs", "type": "Isolation" },
    { "name": "Cable Woodchopper", "muscle": "Abs", "type": "Isolation" }
];

const FOOD_LIST = [
    // Indian Foods
    { name: "Rice", calories: 205 }, { name: "Roti", calories: 85 }, { name: "Chapati", calories: 85 }, { name: "Phulka", calories: 70 }, { name: "Paratha", calories: 250 }, { name: "Aloo Paratha", calories: 300 }, { name: "Paneer Paratha", calories: 350 }, { name: "Dosa", calories: 133 }, { name: "Masala Dosa", calories: 387 }, { name: "Idli", calories: 39 }, { name: "Upma", calories: 250 }, { name: "Rava Upma", calories: 250 }, { name: "Poha", calories: 270 }, { name: "Sabudana Khichdi", calories: 500 }, { name: "Thepla", calories: 150 }, { name: "Bhakri", calories: 120 }, { name: "Puri", calories: 101 }, { name: "Pongal", calories: 335 }, { name: "Moong Dal", calories: 147 }, { name: "Toor Dal", calories: 200 }, { name: "Arhar Dal", calories: 200 }, { name: "Masoor Dal", calories: 230 }, { name: "Chana Dal", calories: 250 }, { name: "Rajma", calories: 330 }, { name: "Kidney Beans", calories: 330 }, { name: "Chole", calories: 250 }, { name: "Chickpeas", calories: 250 }, { name: "Kala Chana", calories: 180 }, { name: "Green Gram", calories: 150 }, { name: "Aloo Bhaji", calories: 200 }, { name: "Bhindi Fry", calories: 150 }, { name: "Baingan Bharta", calories: 100 }, { name: "Cabbage Stir Fry", calories: 100 }, { name: "Matar Paneer", calories: 300 }, { name: "Palak Paneer", calories: 250 }, { name: "Lauki Sabzi", calories: 80 }, { name: "Tinda", calories: 70 }, { name: "Mix Veg", calories: 150 }, { name: "Karela Fry", calories: 120 }, { name: "Drumstick Curry", calories: 180 }, { name: "Bread", calories: 75 }, { name: "Omelette", calories: 154 }, { name: "Boiled Eggs", calories: 78 }, { name: "Maggi", calories: 380 }, { name: "Pakora", calories: 75 }, { name: "Vada", calories: 250 }, { name: "Pav Bhaji", calories: 400 }, { name: "Misal Pav", calories: 450 }, { name: "Bhel Puri", calories: 350 }, { name: "Samosa", calories: 262 }, { name: "Curd", calories: 98 }, { name: "Dahi", calories: 98 }, { name: "Buttermilk", calories: 40 }, { name: "Chaas", calories: 40 }, { name: "Paneer", calories: 265 }, { name: "Ghee", calories: 112 }, { name: "Milk", calories: 150 }, { name: "Chicken Curry", calories: 300 }, { name: "Egg Curry", calories: 250 }, { name: "Mutton Curry", calories: 400 }, { name: "Fish Fry", calories: 250 }, { name: "Tandoori Chicken", calories: 273 }, { name: "Chicken Biryani", calories: 450 }, { name: "Egg Biryani", calories: 380 }, { name: "Masala Chai", calories: 80 }, { name: "Black Tea", calories: 2 }, { name: "Coffee", calories: 5 }, { name: "Filter Coffee", calories: 90 }, { name: "Nimbu Pani", calories: 29 }, { name: "Lassi", calories: 250 }, { name: "Pickle", calories: 20 }, { name: "Achar", calories: 20 }, { name: "Chutney", calories: 30 }, { name: "Raita", calories: 60 }, { name: "Papad", calories: 52 },
    // Western Foods
    { name: "Cornflakes", calories: 100 }, { name: "Cereal", calories: 150 }, { name: "Oats", calories: 150 }, { name: "Peanut Butter Toast", calories: 350 }, { name: "Bread Omelette", calories: 300 }, { name: "Smoothies", calories: 250 }, { name: "Pancakes", calories: 150 }, { name: "Granola Bars", calories: 200 }, { name: "Muesli", calories: 200 }, { name: "Sandwich", calories: 350 }, { name: "Pasta", calories: 400 }, { name: "Noodles", calories: 380 }, { name: "Burger", calories: 450 }, { name: "Wrap", calories: 400 }, { name: "Roll", calories: 350 }, { name: "Pizza", calories: 285 }, { name: "French Fries", calories: 312 }, { name: "Garlic Bread", calories: 150 }, { name: "Eggs", calories: 78 }, { name: "Chicken Breast", calories: 165 }, { name: "Grilled Fish", calories: 200 }, { name: "Tofu", calories: 76 }, { name: "Soy Chunks", calories: 102 }, { name: "Cheese", calories: 113 }, { name: "Greek Yogurt", calories: 59 }, { name: "Black Coffee", calories: 2 }, { name: "Protein Shake", calories: 130 }, { name: "Green Tea", calories: 2 }, { name: "Fruit Juice", calories: 120 }, { name: "Cold Coffee", calories: 200 }, { name: "Diet Soda", calories: 1 }, { name: "Lemon Water", calories: 5 },
    // Fruits
    { name: "Banana", calories: 105 }, { name: "Apple", calories: 95 }, { name: "Mango", calories: 202 }, { name: "Papaya", calories: 119 }, { name: "Watermelon", calories: 86 }, { name: "Orange", calories: 62 }, { name: "Guava", calories: 38 }, { name: "Pomegranate", calories: 234 }, { name: "Grapes", calories: 104 },
    // Dry Fruits & Nuts
    { name: "Almonds", calories: 7 }, { name: "Cashews", calories: 9 }, { name: "Walnuts", calories: 26 }, { name: "Dates", calories: 23 }, { name: "Raisins", calories: 15 },
    // Shakes
    { name: "Milkshake", calories: 300 }, { name: "Banana Milkshake", calories: 350 }, { name: "Mango Milkshake", calories: 380 }, { name: "Strawberry Milkshake", calories: 320 }, { name: "Chocolate Milkshake", calories: 400 }, { name: "Vanilla Milkshake", calories: 300 }, { name: "Oreo Milkshake", calories: 450 }, { name: "Whey Protein Shake", calories: 130 }, { name: "Plant-Based Protein Shake", calories: 120 }
].sort((a, b) => a.name.localeCompare(b.name));


// --- Workout Plan Generation Logic ---
const getExercisesByMuscles = (muscles, excludeLegs = false) => {
    let exercises = EXERCISE_LIST.filter(ex => muscles.includes(ex.muscle));
    if (excludeLegs) {
        exercises = exercises.filter(ex => ex.muscle !== 'Leg' && ex.muscle !== 'Butt');
    }
    return exercises;
};

const PRECONFIGURED_PLANS = {
    Beginner: {
        3: {
            'Day 1': { name: 'Full Body A', muscles: ['Chest', 'Back', 'Leg'] },
            'Day 2': { name: 'Rest Day', muscles: [] },
            'Day 3': { name: 'Full Body B', muscles: ['Shoulder', 'Arm', 'Abs'] },
            'Day 4': { name: 'Rest Day', muscles: [] },
            'Day 5': { name: 'Full Body A', muscles: ['Chest', 'Back', 'Leg'] },
            'Day 6': { name: 'Rest Day', muscles: [] },
            'Day 7': { name: 'Rest Day', muscles: [] },
        },
    },
    Intermediate: {
        4: {
            'Day 1': { name: 'Upper Body A', muscles: ['Chest', 'Back', 'Shoulder'] },
            'Day 2': { name: 'Lower Body A', muscles: ['Leg', 'Butt', 'Abs'] },
            'Day 3': { name: 'Rest Day', muscles: [] },
            'Day 4': { name: 'Upper Body B', muscles: ['Chest', 'Back', 'Arm'] },
            'Day 5': { name: 'Lower Body B', muscles: ['Leg', 'Butt', 'Abs'] },
            'Day 6': { name: 'Rest Day', muscles: [] },
            'Day 7': { name: 'Rest Day', muscles: [] },
        },
    },
    Advanced: {
        5: {
            'Day 1': { name: 'Push Day', muscles: ['Chest', 'Shoulder'] },
            'Day 2': { name: 'Pull Day', muscles: ['Back'] },
            'Day 3': { name: 'Leg Day', muscles: ['Leg', 'Butt'] },
            'Day 4': { name: 'Rest Day', muscles: [] },
            'Day 5': { name: 'Upper Body', muscles: ['Chest', 'Back', 'Shoulder', 'Arm'] },
            'Day 6': { name: 'Lower Body', muscles: ['Leg', 'Butt', 'Abs'] },
            'Day 7': { name: 'Rest Day', muscles: [] },
        }
    }
};

const generateWorkoutPlan = (level, days, excludeLegs = false) => {
    const planTemplate = PRECONFIGURED_PLANS[level]?.[days] || PRECONFIGURED_PLANS.Beginner[3];
    
    const formattedPlan = {};
    for (const dayKey in planTemplate) {
        const dayTemplate = planTemplate[dayKey];
        let exercises = getExercisesByMuscles(dayTemplate.muscles, excludeLegs);

        if (dayTemplate.muscles.length > 0 && exercises.length === 0) {
             formattedPlan[dayKey] = {
                 name: 'Rest Day',
                 exercises: []
            };
        } else {
            formattedPlan[dayKey] = {
                name: dayTemplate.name,
                exercises: exercises.slice(0, 5).map(ex => ({
                    name: ex.name,
                    muscle: ex.muscle,
                    sets: [{ reps: 10, weight: 10 }],
                    notes: ''
                }))
            };
        }
    }
    return formattedPlan;
};


// --- Helper Components ---
const Stepper = ({ currentStep, totalSteps }) => (
    <div className="w-full px-8 mb-8">
        <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className={`h-1 rounded-full flex-1 ${i < currentStep ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
            ))}
        </div>
    </div>
);


const Card = ({ children, className = '', ...props }) => (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`} {...props}>
        {children}
    </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseClasses = 'px-6 py-3 font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-[#494358] text-white hover:bg-[#5A556B] focus:ring-[#5A556B]',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        lightDanger: 'bg-red-400 text-white hover:bg-red-500 focus:ring-red-500',
    };
    return (
        <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`} disabled={disabled}>
            {children}
        </button>
    );
};

const NumberStepper = ({ value, onChange, step, min = 0, max = 1000, disabled = false }) => {
    const handleIncrement = () => {
        if(disabled) return;
        const newValue = Math.min(value + step, max);
        onChange(newValue);
    };

    const handleDecrement = () => {
        if(disabled) return;
        const newValue = Math.max(value - step, min);
        onChange(newValue);
    };
    
    const handleInputChange = (e) => {
        if(disabled) return;
        const rawValue = e.target.value;
        if (rawValue === '') {
            onChange(0);
            return;
        }
        const parsedValue = parseFloat(rawValue);
        if (!isNaN(parsedValue)) {
            const clampedValue = Math.max(min, Math.min(parsedValue, max));
            onChange(clampedValue);
        }
    };

    return (
        <div className="flex items-center justify-center w-full bg-gray-100 rounded-full p-0.5">
            <button type="button" onClick={handleDecrement} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0">
                <Minus size={16} />
            </button>
            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                className="text-lg font-semibold w-full min-w-0 text-center bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-transparent"
                disabled={disabled}
            />
            <button type="button" onClick={handleIncrement} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0">
                <Plus size={16} />
            </button>
        </div>
    );
};


// --- Simple Chart Components ---
const SimpleLineChart = ({ data, title }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;
    
    const maxWeight = Math.max(...data.map(d => d.weight));
    const minWeight = Math.min(...data.map(d => d.weight));
    const range = maxWeight - minWeight || 1;
    
    return (
        <div className="w-full">
            <h4 className="text-center mb-4 font-semibold">{title}</h4>
            <div className="relative h-40 border border-gray-200 rounded">
                <svg className="w-full h-full">
                    {data.map((point, index) => {
                        if (index === 0) return null;
                        const prevPoint = data[index - 1];
                        const x1 = ((index - 1) / (data.length - 1)) * 100;
                        const x2 = (index / (data.length - 1)) * 100;
                        const y1 = 100 - ((prevPoint.weight - minWeight) / range) * 80;
                        const y2 = 100 - ((point.weight - minWeight) / range) * 80;
                        
                        return (
                            <line
                                key={index}
                                x1={`${x1}%`}
                                y1={`${y1}%`}
                                x2={`${x2}%`}
                                y2={`${y2}%`}
                                stroke="#494358"
                                strokeWidth="2"
                            />
                        );
                    })}
                    {data.map((point, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - ((point.weight - minWeight) / range) * 80;
                        return (
                            <circle
                                key={index}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r="4"
                                fill="#494358"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{data[0]?.date}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
};

const SimplePieChart = ({ data, title }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#494358', '#5A556B', '#8d8d8d', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];
    
    return (
        <div className="w-full">
            <h4 className="text-center mb-4 font-semibold">{title}</h4>
            <div className="grid grid-cols-1 gap-2">
                {data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div 
                                    className="w-4 h-4 rounded mr-2" 
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                ></div>
                                <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold">{percentage}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Onboarding Components ---
const ProfileSetup = ({ onNext, profileData, setProfileData }) => {
    const { name, age, gender, photo } = profileData;
    const fileInputRef = useRef(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const isComplete = name && age && gender;

    return (
        <div className="p-4">
            <div className="text-left py-8">
                <h1 className="text-5xl font-light text-gray-800">Tell Us About</h1>
                <h1 className="text-5xl font-semibold text-gray-800">Yourself</h1>
            </div>
            <p className="text-gray-600 mb-8 text-left">This helps us personalize your experience.</p>
            
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center justify-center overflow-hidden">
                    {photo ? (
                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-gray-400" />
                    )}
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                        <Camera size={20} className="text-gray-600" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                    />
                </div>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg text-lg"
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setProfileData(p => ({ ...p, age: e.target.value }))}
                    className="w-full p-3 border rounded-lg text-lg"
                />
                <select
                    value={gender}
                    onChange={(e) => setProfileData(p => ({ ...p, gender: e.target.value }))}
                    className="w-full p-3 border rounded-lg text-lg bg-white"
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
            </div>

            <div className="mt-8 text-center">
                <Button onClick={onNext} disabled={!isComplete}>Next</Button>
            </div>
        </div>
    );
};

const UnitSwitch = ({ options, selected, onSelect }) => (
    <div className="bg-transparent rounded-full p-1 flex ring-1 ring-gray-300">
        {options.map(option => (
            <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className={`w-full py-1.5 px-6 rounded-full text-sm font-semibold transition-colors duration-300 ${selected === option.value ? 'bg-[#494358] text-white' : 'text-gray-500'}`}
            >
                {option.label}
            </button>
        ))}
    </div>
);

const RulerSlider = ({ min, max, value, onChange, unit }) => {
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    const PIXELS_PER_UNIT = 20;
    const rulerWidth = (max - min) * PIXELS_PER_UNIT;

    useEffect(() => {
        const centerValue = (value - min) * PIXELS_PER_UNIT;
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = centerValue;
        }
    }, [value, min]);

    const handleDragStart = (clientX) => {
        isDragging.current = true;
        startX.current = clientX;
        scrollLeftStart.current = scrollRef.current.scrollLeft;
    };

    const handleDragMove = (clientX) => {
        if (!isDragging.current) return;
        const walk = (clientX - startX.current);
        const newScrollLeft = scrollLeftStart.current - walk;
        scrollRef.current.scrollLeft = newScrollLeft;
        const newValue = Math.round(min + newScrollLeft / PIXELS_PER_UNIT);
        if (newValue >= min && newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDragEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const currentScroll = scrollRef.current.scrollLeft;
        const nearestValue = min + Math.round(currentScroll / PIXELS_PER_UNIT);
        const targetScroll = (nearestValue - min) * PIXELS_PER_UNIT;
        
        scrollRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        if (nearestValue !== value) {
            onChange(nearestValue);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div
                className="relative w-full h-24 overflow-hidden cursor-grab active:cursor-grabbing"
                ref={scrollRef}
                onMouseDown={(e) => handleDragStart(e.pageX)}
                onMouseLeave={handleDragEnd}
                onMouseUp={handleDragEnd}
                onMouseMove={(e) => handleDragMove(e.pageX)}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-0 h-12 w-1 bg-black rounded-full z-10 pointer-events-none"></div>
                <div className="absolute top-1/2 -translate-y-1/2 h-12" style={{ width: `${rulerWidth}px`, paddingLeft: '50%', paddingRight: '50%' }}>
                    <svg width="100%" height="100%" className="text-gray-400">
                        {Array.from({ length: max - min + 1 }).map((_, i) => {
                            const currentValue = min + i;
                            const isTen = currentValue % 10 === 0;
                            const x = i * PIXELS_PER_UNIT;

                            return (
                                <g key={currentValue}>
                                    <line
                                        x1={x} y1={isTen ? 12 : 18}
                                        x2={x} y2={30}
                                        stroke="currentColor"
                                        strokeWidth={isTen ? "2" : "1"}
                                    />
                                    {isTen && (
                                        <text x={x} y="10" textAnchor="middle" className="text-xs font-semibold fill-current">
                                            {currentValue}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
            <span className="text-sm font-semibold text-gray-800 mt-1">{unit}</span>
        </div>
    );
};

const OnboardingNavigation = ({ onNext, onBack }) => (
    <div className="fixed bottom-8 left-0 right-0 px-8 flex items-center justify-between">
        <button onClick={onBack} className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center">
            <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <button onClick={onNext} className="bg-[#494358] hover:bg-[#5A556B] text-white font-semibold rounded-full px-10 py-4">
            Next
        </button>
    </div>
);

const WeightSelector = ({ onNext, onBack, profileData, setProfileData }) => {
    const [weightUnit, setWeightUnit] = useState('kg');
    const weightInKg = profileData.weight || 70;

    const handleWeightChange = useCallback((newValue) => {
        let weightInKgValue;
        if (weightUnit === 'kg') {
            weightInKgValue = newValue;
        } else {
            weightInKgValue = newValue / 2.20462;
        }
        setProfileData(p => ({ ...p, weight: weightInKgValue }));
    }, [weightUnit, setProfileData]);

    const weightSliderProps = useMemo(() => (weightUnit === 'kg' 
        ? { min: 30, max: 150, value: Math.round(weightInKg) }
        : { min: 66, max: 330, value: Math.round(weightInKg * 2.20462) }
    ), [weightUnit, weightInKg]);

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="text-left py-8 w-full max-w-sm px-4 mx-auto">
                <h2 className="text-5xl font-light text-gray-800">What is your</h2>
                <h2 className="text-5xl font-semibold text-gray-800">Weight?</h2>
            </div>
            <div className="flex-grow flex flex-col items-center justify-start pt-8">
                <div className="mb-8">
                    <UnitSwitch
                        options={[{ label: 'lb', value: 'lb' }, { label: 'kg', value: 'kg' }]}
                        selected={weightUnit}
                        onSelect={setWeightUnit}
                    />
                </div>
                <div className="w-full max-w-sm bg-[#F6F3BA] p-6 rounded-3xl">
                    <div className="text-center mb-4">
                        <span className="text-8xl font-bold text-[#262642]">{weightSliderProps.value}</span>
                    </div>
                    <RulerSlider
                        min={weightSliderProps.min}
                        max={weightSliderProps.max}
                        value={weightSliderProps.value}
                        onChange={handleWeightChange}
                        unit={weightUnit}
                    />
                </div>
            </div>
            <OnboardingNavigation onNext={onNext} onBack={onBack} />
        </div>
    );
};

const HeightSelector = ({ onNext, onBack, profileData, setProfileData }) => {
    const [heightUnit, setHeightUnit] = useState('cm');
    const heightInCm = profileData.height || 170;

    const handleHeightChange = useCallback((newValue) => {
        let heightInCmValue;
        if (heightUnit === 'cm') {
            heightInCmValue = newValue;
        } else {
            heightInCmValue = newValue * 2.54;
        }
        setProfileData(p => ({ ...p, height: heightInCmValue }));
    }, [heightUnit, setProfileData]);

    const heightSliderProps = useMemo(() => {
        if (heightUnit === 'cm') {
            return { min: 120, max: 220, value: Math.round(heightInCm) };
        } else {
            const totalInches = heightInCm / 2.54;
            return { min: 48, max: 86, value: Math.round(totalInches) };
        }
    }, [heightUnit, heightInCm]);
    
    const displayHeight = useMemo(() => {
        if (heightUnit === 'cm') return `${Math.round(heightInCm)}`;
        const totalInches = heightInCm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}' ${inches}"`;
    }, [heightInCm, heightUnit]);

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="text-left py-8 w-full max-w-sm px-4 mx-auto">
                <h2 className="text-5xl font-light text-gray-800">What is your</h2>
                <h2 className="text-5xl font-semibold text-gray-800">Height?</h2>
            </div>
            <div className="flex-grow flex flex-col items-center justify-start pt-8">
                <div className="mb-8">
                    <UnitSwitch
                        options={[{ label: 'ft-in', value: 'ft-in' }, { label: 'cm', value: 'cm' }]}
                        selected={heightUnit}
                        onSelect={setHeightUnit}
                    />
                </div>
                <div className="w-full max-w-sm bg-[#D6EBEB] p-6 rounded-3xl">
                    <div className="text-center mb-4">
                       <span className="text-8xl font-bold text-[#262642]">{displayHeight}</span>
                    </div>
                     <RulerSlider
                        min={heightSliderProps.min}
                        max={heightSliderProps.max}
                        value={heightSliderProps.value}
                        onChange={handleHeightChange}
                        unit={heightUnit === 'cm' ? 'cm' : 'in'}
                    />
                </div>
            </div>
            <OnboardingNavigation onNext={onNext} onBack={onBack} />
        </div>
    );
};

const PlanConfiguration = ({ onFinish, onBack, profileData, setProfileData }) => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const dayOptions = [3, 4, 5, 6, 7];
    const [selectedDays, setSelectedDays] = useState(null);
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [excludeLegs, setExcludeLegs] = useState(false);

    const handleLevelSelect = (level) => {
        setProfileData(p => ({ ...p, fitnessLevel: level }));
        setSelectedDays(null); // Reset day selection when level changes
        setWorkoutPlan(null);
    };

    const handleDaySelect = (days) => {
        setSelectedDays(days);
        const plan = generateWorkoutPlan(profileData.fitnessLevel, days, excludeLegs);
        setWorkoutPlan(plan);
    };
    
    useEffect(() => {
        if (profileData.fitnessLevel && selectedDays) {
            const plan = generateWorkoutPlan(profileData.fitnessLevel, selectedDays, excludeLegs);
            setWorkoutPlan(plan);
        }
    }, [excludeLegs, profileData.fitnessLevel, selectedDays]);

    const handleFinalizePlan = () => {
        saveToStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, profileData);
        saveToStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN, workoutPlan);

        const logs = [];
        let dayCounter = 0;
        for (let i = 0; i < 7; i++) {
            const dayKey = `Day ${i + 1}`;
            const dayPlan = workoutPlan[dayKey];
            if (dayPlan && dayPlan.exercises.length > 0) {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + dayCounter);
                logs.push({
                    id: generateId(),
                    day: String(i + 1),
                    planDay: dayKey,
                    name: dayPlan.name || '',
                    date: nextDate.toISOString().split('T')[0],
                    completed: false,
                    skipped: false,
                    exercises: dayPlan.exercises
                });
            }
             dayCounter++;
        }
        saveToStorage(LOCAL_STORAGE_KEYS.LOGS, logs);
        onFinish();
    };

    const handleAddExercises = (newExercises) => {
        const exercisesWithDefaults = newExercises.map(ex => ({
            name: ex.name,
            muscle: ex.muscle,
            sets: [{ reps: 10, weight: 10 }],
            notes: ''
        }));
        setWorkoutPlan(prev => ({
            ...prev,
            [editingDay]: {
                ...prev[editingDay],
                exercises: [...prev[editingDay].exercises, ...exercisesWithDefaults]
            }
        }));
    };

    const removeExercise = (day, index) => {
        setWorkoutPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: prev[day].exercises.filter((_, i) => i !== index)
            }
        }));
    };

    if (editingDay) {
        return (
            <>
                <div className="p-4 max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold mb-4 text-center">Editing {workoutPlan[editingDay].name || editingDay}</h2>
                    <Card>
                         {workoutPlan[editingDay].exercises.length === 0 ? (
                            <p className="text-center text-gray-500">No exercises added yet.</p>
                        ) : (
                            <div className="mb-4 space-y-2">
                                {workoutPlan[editingDay].exercises.map((ex, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                                        <span>{ex.name}</span>
                                        <button onClick={() => removeExercise(editingDay, index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-4 mt-6">
                            <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="w-full">
                                <Plus size={18} className="inline-block mr-2"/> Add Exercise
                            </Button>
                            <Button onClick={() => setEditingDay(null)} variant="primary" className="w-full">
                                Confirm
                            </Button>
                        </div>
                    </Card>
                </div>
                <AddExerciseModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddExercises={handleAddExercises}
                    goals={[]}
                />
            </>
        )
    }

    return (
        <div className="p-4">
            <div className="text-left py-8">
                <h1 className="text-5xl font-light text-gray-800">Configure Your</h1>
                <h1 className="text-5xl font-semibold text-gray-800">Plan</h1>
            </div>
            <p className="text-gray-600 mb-8 text-left">Select your level, then choose how many days you want to work out.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {levels.map(level => (
                    <button
                        key={level}
                        onClick={() => handleLevelSelect(level)}
                        className={`p-4 rounded-full text-lg font-medium transition-all duration-200 w-full sm:w-48 ${profileData.fitnessLevel === level ? 'bg-[#494358] text-white scale-105' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            {profileData.fitnessLevel && (
                 <div className="my-8">
                    <div className="flex justify-center items-center gap-2 sm:gap-4 bg-gray-100 p-2 rounded-full max-w-xl mx-auto">
                        {dayOptions.map(days => (
                            <button 
                                key={days}
                                onClick={() => handleDaySelect(days)}
                                className={`flex-1 py-2 px-3 rounded-full font-semibold transition-colors ${selectedDays === days ? 'bg-white shadow' : 'bg-transparent'} ${days === 7 ? 'text-red-500' : 'text-gray-700'}`}
                            >
                                {days} Days
                            </button>
                        ))}
                         <button 
                            onClick={() => setExcludeLegs(!excludeLegs)}
                            className={`w-12 h-10 flex items-center justify-center rounded-full transition-colors ${excludeLegs ? 'bg-red-500 text-white' : 'bg-white'}`}
                            title="Toggle Leg Workouts"
                        >
                            <span role="img" aria-label="leg" className="text-2xl">🦵</span>
                        </button>
                    </div>
                 </div>
            )}

            {workoutPlan && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-center mb-4">Your Pre-configured Plan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.keys(workoutPlan).map(day => (
                            <Card key={day}>
                                <h3 className="font-bold text-xl mb-2">{day}</h3>
                                <p className="text-[#494358] font-semibold truncate mb-2">{workoutPlan[day].name || 'Rest Day'}</p>
                                {workoutPlan[day].exercises && workoutPlan[day].exercises.length > 0 ? (
                                    <ul className="list-disc list-inside text-gray-600 text-sm">
                                        {workoutPlan[day].exercises.slice(0,3).map((ex, i) => <li key={i} className="truncate">{ex.name}</li>)}
                                        {workoutPlan[day].exercises.length > 3 && <li>...</li>}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">Rest Day</p>
                                )}
                                <button onClick={() => setEditingDay(day)} className="text-[#494358] font-semibold mt-4 flex items-center text-sm hover:underline">
                                    Edit Day <Edit size={14} className="ml-1" />
                                </button>
                            </Card>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Button onClick={handleFinalizePlan}>Proceed with this Workout</Button>
                    </div>
                </div>
            )}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                 <button onClick={onBack} className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
            </div>
        </div>
    );
};

const Onboarding = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const [profileData, setProfileData] = useState({
        name: '',
        age: '',
        gender: '',
        photo: null,
        weight: 70, // default weight in kg
        height: 170, // default height in cm
        fitnessLevel: ''
    });

    const steps = [
        <ProfileSetup onNext={() => setStep(1)} profileData={profileData} setProfileData={setProfileData} />,
        <WeightSelector onNext={() => setStep(2)} onBack={() => setStep(0)} profileData={profileData} setProfileData={setProfileData} />,
        <HeightSelector onNext={() => setStep(3)} onBack={() => setStep(1)} profileData={profileData} setProfileData={setProfileData} />,
        <PlanConfiguration onFinish={onFinish} onBack={() => setStep(2)} profileData={profileData} setProfileData={setProfileData} />,
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col h-screen">
            <Stepper currentStep={step + 1} totalSteps={steps.length} />
            <div className="flex-grow">
                {steps[step]}
            </div>
        </div>
    );
};

// --- Main App Components ---
const AddExerciseModal = ({ isOpen, onClose, onAddExercises, goals }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [muscleFilter, setMuscleFilter] = useState('All');
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [customExercise, setCustomExercise] = useState('');
    
    const muscleGroups = useMemo(() => {
        const allMuscles = [...new Set(EXERCISE_LIST.map(e => e.muscle))];
        const sortedMuscles = allMuscles.sort((a, b) => {
            const aIsGoal = goals.includes(a);
            const bIsGoal = goals.includes(b);
            if (aIsGoal && !bIsGoal) return -1;
            if (!aIsGoal && bIsGoal) return 1;
            return a.localeCompare(b);
        });
        return ['All', ...sortedMuscles];
    }, [goals]);

    const filteredExercises = useMemo(() => {
        return EXERCISE_LIST.filter(ex => 
            (muscleFilter === 'All' || ex.muscle === muscleFilter) &&
            ex.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, muscleFilter]);

    const toggleExerciseSelection = (exercise) => {
        setSelectedExercises(prev => 
            prev.some(e => e.name === exercise.name)
                ? prev.filter(e => e.name !== exercise.name)
                : [...prev, exercise]
        );
    };

    const handleAdd = () => {
        const exercisesToAdd = [...selectedExercises];
        if (customExercise.trim()) {
            exercisesToAdd.push({ name: customExercise.trim(), muscle: 'Custom', type: 'Custom' });
        }
        onAddExercises(exercisesToAdd);
        setSelectedExercises([]);
        setCustomExercise('');
        setSearchTerm('');
        setMuscleFilter('All');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold">Add Exercises</h2>
                </div>
                <div className="p-4 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                         <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search exercises..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 border rounded-md"
                            />
                        </div>
                        <select 
                            value={muscleFilter} 
                            onChange={e => setMuscleFilter(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-grow">
                    <ul className="space-y-2">
                        {filteredExercises.map(ex => (
                            <li key={ex.name} onClick={() => toggleExerciseSelection(ex)} className={`p-3 rounded-md cursor-pointer flex justify-between items-center transition-colors ${selectedExercises.some(e => e.name === ex.name) ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>
                                <div>
                                    <span className="font-semibold">{ex.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">{ex.muscle}</span>
                                </div>
                                <input type="checkbox" readOnly checked={selectedExercises.some(e => e.name === ex.name)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
                            </li>
                        ))}
                    </ul>
                     <div className="mt-4 pt-4 border-t">
                        <input
                            type="text"
                            placeholder="Or add a custom exercise"
                            value={customExercise}
                            onChange={e => setCustomExercise(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-4">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleAdd} disabled={selectedExercises.length === 0 && !customExercise.trim()}>Add</Button>
                </div>
            </div>
        </div>
    );
};

const ScheduleCreator = ({ onScheduleCreated }) => {
    const days = useMemo(() => ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'], []);
    const [workoutPlan, setWorkoutPlan] = useState(() => days.reduce((acc, day) => ({ ...acc, [day]: { name: '', exercises: [] } }), {}));
    const [editingDay, setEditingDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userGoals, setUserGoals] = useState([]);

    useEffect(() => {
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE) || {};
        if (profile.goals) {
            setUserGoals(profile.goals);
        }

        const existingPlan = getFromStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN);
        if (existingPlan) {
            setWorkoutPlan(existingPlan);
        }
    }, []);

    const handleAddExercises = (newExercises) => {
        const exercisesWithDefaults = newExercises.map(ex => ({
            name: ex.name,
            muscle: ex.muscle,
            sets: [{ reps: 10, weight: 10 }],
            notes: ''
        }));
        setWorkoutPlan(prev => ({
            ...prev,
            [editingDay]: {
                ...prev[editingDay],
                exercises: [...prev[editingDay].exercises, ...exercisesWithDefaults]
            }
        }));
    };
    
    const removeExercise = (day, index) => {
        setWorkoutPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: prev[day].exercises.filter((_, i) => i !== index)
            }
        }));
    };

    const handleDayNameChange = (day, name) => {
        setWorkoutPlan(prev => ({
            ...prev,
            [day]: { ...prev[day], name: name }
        }));
    };

    const saveSchedule = () => {
        saveToStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN, workoutPlan);

        const logs = [];
        let dayCounter = 0;
        
        for (let i = 0; i < 7; i++) {
            const dayKey = `Day ${i + 1}`;
            const dayPlan = workoutPlan[dayKey];
            
            if (dayPlan.exercises && dayPlan.exercises.length > 0) {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + dayCounter);

                logs.push({
                    id: generateId(),
                    day: String(i + 1),
                    planDay: dayKey,
                    name: dayPlan.name || '',
                    date: nextDate.toISOString().split('T')[0],
                    completed: false,
                    skipped: false,
                    exercises: dayPlan.exercises.map(ex => ({ 
                        ...ex, 
                        sets: ex.sets || [{reps: 10, weight: 10}], 
                        logged: false, 
                        notes: ex.notes || '' 
                    }))
                });
            }
            dayCounter++;
        }

        saveToStorage(LOCAL_STORAGE_KEYS.LOGS, logs);
        alert("Schedule updated successfully!");
        onScheduleCreated();
    };

    if (editingDay) {
        return (
            <>
                <div className="p-4 max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold mb-4 text-center">Editing {editingDay}</h2>
                    <Card>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Custom Day Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Chest & Triceps"
                                value={workoutPlan[editingDay].name}
                                onChange={(e) => handleDayNameChange(editingDay, e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4 h-px bg-gray-200"></div>
                        {workoutPlan[editingDay].exercises.length === 0 ? (
                            <p className="text-center text-gray-500">No exercises added yet.</p>
                        ) : (
                            <div className="mb-4 space-y-2">
                                {workoutPlan[editingDay].exercises.map((ex, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                                        <span>{ex.name}</span>
                                        <button onClick={() => removeExercise(editingDay, index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-4 mt-6">
                            <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="w-full">
                                <Plus size={18} className="inline-block mr-2"/> Add Exercise
                            </Button>
                            <Button onClick={() => setEditingDay(null)} variant="primary" className="w-full">
                                Confirm
                            </Button>
                        </div>
                    </Card>
                </div>
                <AddExerciseModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddExercises={handleAddExercises}
                    goals={userGoals}
                />
            </>
        );
    }

    return (
        <div className="p-4">
            <div className="text-left py-8">
                <h1 className="text-5xl font-light">Your Weekly</h1>
                <h1 className="text-5xl font-semibold">Plan</h1>
            </div>
            <p className="text-left text-gray-600 mb-8">Tap a day to add or edit exercises. This will reset your timeline.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {days.map(day => (
                    <Card key={day} className="cursor-pointer" onClick={() => setEditingDay(day)}>
                        <h3 className="font-bold text-xl mb-2">{day}</h3>
                        <p className="text-[#494358] font-semibold truncate mb-2">{workoutPlan[day].name || '...'}</p>
                        {workoutPlan[day].exercises && workoutPlan[day].exercises.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-600">
                                {workoutPlan[day].exercises.slice(0,2).map((ex, i) => <li key={i}>{ex.name}</li>)}
                                {workoutPlan[day].exercises.length > 2 && <li>...</li>}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Rest Day</p>
                        )}
                        <div className="text-[#494358] font-semibold mt-4 flex items-center">Edit Day <Edit size={16} className="ml-2" /></div>
                    </Card>
                ))}
            </div>
            <div className="text-center mt-8">
                <Button onClick={saveSchedule}>Update Schedule</Button>
            </div>
        </div>
    );
};

const HomeScreen = ({ onNavigate }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const itemRefs = useRef([]);

    useEffect(() => {
        const savedLogs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
        setLogs(savedLogs);
        setLoading(false);
    }, []);

    const getDayName = (log) => {
        if (log.name && log.name.trim() !== '') return log.name;
        if (!log.exercises || log.exercises.length === 0) return "Rest Day";
        const muscles = [...new Set(log.exercises.map(e => e.muscle).filter(Boolean))];
        if (muscles.length === 0) return 'Workout';
        return muscles.join(' & ');
    };

    const timelineDays = useMemo(() => {
        const workoutLogs = logs.filter(log => log.exercises && log.exercises.length > 0);
        const sortedLogs = workoutLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const activeLog = sortedLogs.find(l => !l.completed);

        return sortedLogs.map((log, index) => {
            const name = getDayName(log);
            let status = 'locked';
            if (log.completed) {
                status = 'completed';
            } else if (activeLog && log.id === activeLog.id) {
                status = 'current';
            }
            
            return {
                dayKey: `Day ${index + 1}`,
                name,
                isRestDay: false,
                status,
                logId: log.id,
                date: log.date,
            };
        });
    }, [logs]);

    useEffect(() => {
        if (!loading && timelineDays.length > 0) {
            const currentIndex = timelineDays.findIndex(day => day.status === 'current');
            if (currentIndex !== -1 && itemRefs.current[currentIndex]) {
                setTimeout(() => {
                    itemRefs.current[currentIndex]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        }
    }, [loading, timelineDays]);

    if (loading) {
        return <div className="text-center p-10">Loading your timeline...</div>;
    }

    if (timelineDays.length === 0) {
        return (
             <div className="text-center p-10">
                <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
                <p className="text-gray-600 mb-6">You haven't set up a schedule yet. Let's create one!</p>
                <Button onClick={() => onNavigate('schedule')}>Create Schedule</Button>
            </div>
        )
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="text-left py-8">
                <h1 className="text-5xl font-light">Workout</h1>
                <h1 className="text-5xl font-semibold">Timeline</h1>
            </div>
            <div className="space-y-4">
                {timelineDays.map((day, index) => {
                    const cardRef = el => itemRefs.current[index] = el;

                    if (day.status === 'current') {
                        return (
                            <div ref={cardRef} key={day.logId} className="bg-[#494358] text-white rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-2xl">{day.dayKey}</h2>
                                    <p className="opacity-90">{day.name}</p>
                                    <p className="text-sm opacity-70 mt-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                                {!day.isRestDay && (
                                    <button onClick={() => onNavigate('dayDetail', { logId: day.logId })} className="bg-white text-[#494358] font-bold py-2 px-5 rounded-full hover:bg-gray-200">
                                        Start
                                    </button>
                                )}
                            </div>
                        );
                    }
                    
                    const isClickable = day.status === 'completed' && day.logId;
                    return (
                        <div ref={cardRef} key={day.logId} onClick={() => isClickable && onNavigate('dayDetail', { logId: day.logId })} className={`bg-white rounded-xl p-4 flex justify-between items-center border border-gray-200 ${day.status === 'completed' ? 'opacity-50' : ''} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}>
                            <div>
                                <h2 className="font-bold text-2xl">{day.dayKey}</h2>
                                <p className="text-gray-500">{day.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            {day.status === 'completed' 
                                ? <CheckCircle className="text-green-500" size={24} /> 
                                : <Lock className="text-gray-400" size={24} />
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DayDetail = ({ logId, onBack, onNavigate }) => {
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const logs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
        const foundLog = logs.find(l => l.id === logId);
        if (foundLog) {
            foundLog.exercises = foundLog.exercises.map(ex => ({
                ...ex, 
                sets: ex.sets || [], 
                skipped: ex.skipped || false 
            }));
            setLog(foundLog);
        }
        setLoading(false);
    }, [logId]);
    
    const updateLog = (updatedExercises) => {
        const logs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
        const logIndex = logs.findIndex(l => l.id === logId);
        if (logIndex !== -1) {
            logs[logIndex].exercises = updatedExercises;
            saveToStorage(LOCAL_STORAGE_KEYS.LOGS, logs);
        }
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const newLog = { ...log };
        const parsedValue = parseFloat(value) || 0;
        newLog.exercises[exerciseIndex].sets[setIndex][field] = parsedValue;
        if (!newLog.exercises[exerciseIndex].logged) {
            newLog.exercises[exerciseIndex].logged = true;
        }
        setLog(newLog);
        updateLog(newLog.exercises);
    };

    const handleNoteChange = (exerciseIndex, value) => {
        const newLog = { ...log };
        newLog.exercises[exerciseIndex].notes = value;
        setLog(newLog);
        updateLog(newLog.exercises);
    };

    const addSet = (exerciseIndex) => {
        const newLog = { ...log };
        const currentSets = newLog.exercises[exerciseIndex].sets;
        const lastSet = currentSets.length > 0 ? currentSets[currentSets.length - 1] : { reps: 10, weight: 10 };
        newLog.exercises[exerciseIndex].sets.push({ ...lastSet });
        if (!newLog.exercises[exerciseIndex].logged) {
            newLog.exercises[exerciseIndex].logged = true;
        }
        setLog(newLog);
        updateLog(newLog.exercises);
    };

    const removeSet = (exerciseIndex, setIndex) => {
        const newLog = { ...log };
        newLog.exercises[exerciseIndex].sets.splice(setIndex, 1);
        if (newLog.exercises[exerciseIndex].sets.length === 0 && !newLog.exercises[exerciseIndex].skipped) {
            newLog.exercises[exerciseIndex].logged = false;
        }
        setLog(newLog);
        updateLog(newLog.exercises);
    };

    const toggleSkipExercise = (exerciseIndex) => {
        const newLog = { ...log };
        const exercise = newLog.exercises[exerciseIndex];
        exercise.skipped = !exercise.skipped;
        if (exercise.skipped) {
            exercise.sets = [];
        }
        setLog(newLog);
        updateLog(newLog.exercises);
    };

    const markDayAsComplete = () => {
        // 1. Mark current log as complete
        const logs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
        const logIndex = logs.findIndex(l => l.id === logId);
        if (logIndex !== -1) {
            logs[logIndex].completed = true;
            saveToStorage(LOCAL_STORAGE_KEYS.LOGS, logs);
        }

        // 2. Save progress for analytics
        const exerciseProgress = getFromStorage(LOCAL_STORAGE_KEYS.EXERCISE_PROGRESS) || [];
        log.exercises.forEach((ex) => {
            if (!ex.skipped && ex.logged && ex.sets && ex.sets.length > 0) {
                const heaviestSet = ex.sets.reduce((maxSet, currentSet) => 
                    currentSet.weight > maxSet.weight ? currentSet : maxSet, ex.sets[0]);
                exerciseProgress.push({
                    id: generateId(),
                    exerciseName: ex.name,
                    date: log.date,
                    reps: heaviestSet.reps,
                    weight: heaviestSet.weight,
                    muscle: ex.muscle || 'Custom'
                });
            }
        });
        saveToStorage(LOCAL_STORAGE_KEYS.EXERCISE_PROGRESS, exerciseProgress);
        
        // 3. Check if we need to generate the next cycle
        const futureLogs = logs.filter(l => !l.completed);
        
        if (futureLogs.length <= 1) { 
            const plan = getFromStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN) || {};
            const lastDayIndex = Math.max(0, ...logs.map(l => parseInt(l.day)));
            const lastDayDate = new Date(Math.max(...logs.map(l => new Date(l.date))));

            for (let i = 0; i < 7; i++) {
                const planDayKey = `Day ${i + 1}`;
                const dayPlan = plan[planDayKey];

                if (dayPlan && dayPlan.exercises && dayPlan.exercises.length > 0) {
                    const nextDate = new Date(lastDayDate);
                    nextDate.setDate(nextDate.getDate() + i + 1);

                    logs.push({
                        id: generateId(),
                        day: String(lastDayIndex + i + 1),
                        planDay: planDayKey,
                        name: dayPlan.name || '',
                        date: nextDate.toISOString().split('T')[0],
                        completed: false,
                        skipped: false,
                        exercises: dayPlan.exercises.map(ex => ({ 
                            ...ex, 
                            sets: ex.sets || [{reps: 10, weight: 10}], 
                            logged: false, 
                            notes: ex.notes || '' 
                        }))
                    });
                }
            }
            saveToStorage(LOCAL_STORAGE_KEYS.LOGS, logs);
        }

        onBack();
    };

    if (loading) return <div className="text-center p-10">Loading exercises...</div>;
    if (!log) return <div className="text-center p-10 text-red-500">Could not load workout details.</div>;

    const allExercisesHandled = log.exercises.every(ex => (ex.sets && ex.sets.length > 0) || ex.skipped);

    return (
        <div className="p-4">
            <button onClick={onBack} className="flex items-center text-indigo-600 mb-4"><ArrowLeft size={18} className="mr-2"/> Back to Timeline</button>
            <div className="text-left py-8">
                <h1 className="text-5xl font-light">Day {log.day}</h1>
                <h1 className="text-5xl font-semibold">Workout</h1>
            </div>
            <p className="text-gray-500 mb-6 text-left">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="space-y-4">
                {log.exercises.map((ex, exerciseIndex) => (
                    <Card key={exerciseIndex} className={`transition-opacity ${ex.skipped ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex justify-between items-start">
                           <h3 className={`text-xl font-bold mb-3 ${ex.skipped ? 'line-through' : ''}`}>{ex.name}</h3>
                           <div className="flex items-center space-x-2">
                                <button onClick={() => onNavigate('progressGraph', { exerciseName: ex.name, logId: log.id })} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100">
                                    <BarChart2 size={20} />
                                </button>
                                <button onClick={() => onNavigate('mediaManager', { exerciseName: ex.name, logId: log.id })} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100">
                                    <ImageIcon size={20} />
                                </button>
                           </div>
                        </div>
                        
                        {!ex.skipped && (
                            <>
                                <div className="grid grid-cols-11 gap-x-2 text-center mb-2 px-2 text-sm font-semibold text-gray-500">
                                    <div className="col-span-1">Set</div>
                                    <div className="col-span-4">Weight (kg)</div>
                                    <div className="col-span-4">Reps</div>
                                    <div className="col-span-2"></div>
                                </div>

                                <div className="space-y-2">
                                    {ex.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="grid grid-cols-11 gap-x-2 items-center">
                                            <div className="col-span-1 text-center font-medium">{setIndex + 1}</div>
                                            <div className="col-span-4">
                                                <NumberStepper value={set.weight} onChange={(newWeight) => handleSetChange(exerciseIndex, setIndex, 'weight', newWeight)} step={2.5} />
                                            </div>
                                            <div className="col-span-4">
                                                <NumberStepper value={set.reps} onChange={(newReps) => handleSetChange(exerciseIndex, setIndex, 'reps', newReps)} step={1} />
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <button onClick={() => removeSet(exerciseIndex, setIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                            {!ex.skipped ? (
                                <>
                                <Button onClick={() => addSet(exerciseIndex)} variant="secondary" className="w-full py-2">
                                    <Plus size={18} className="inline-block mr-2" /> Add Set
                                </Button>
                                <button onClick={() => toggleSkipExercise(exerciseIndex)} className="bg-red-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-red-600">
                                    Give Up
                                </button>
                                </>
                            ) : (
                                <Button onClick={() => toggleSkipExercise(exerciseIndex)} variant="secondary" className="w-full py-2">
                                    <Undo size={18} className="inline-block mr-2" /> Undo Skip
                                </Button>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-500">Notes</label>
                            <textarea value={ex.notes || ''} onChange={e => handleNoteChange(exerciseIndex, e.target.value)} rows="2" className="w-full p-2 border rounded-md" placeholder="e.g., 'Felt strong today'"></textarea>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="mt-8 text-center">
                <Button onClick={markDayAsComplete} disabled={!allExercisesHandled || log.completed}>
                    {log.completed ? 'Workout Completed' : 'Mark Day as Complete'}
                </Button>
                 {!allExercisesHandled && <p className="text-sm text-gray-500 mt-2">Log or skip each exercise to complete the day.</p>}
            </div>
        </div>
    );
};

const ProgressGraph = ({ exerciseName, onBack }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const exerciseProgress = getFromStorage(LOCAL_STORAGE_KEYS.EXERCISE_PROGRESS) || [];
        const filteredData = exerciseProgress
            .filter(d => d.exerciseName === exerciseName)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(d => ({...d, date: new Date(d.date).toLocaleDateString('en-ca')}));
        
        setData(filteredData);
        setLoading(false);
    }, [exerciseName]);

    if (loading) return <div className="text-center p-10">Loading graph...</div>;
    
    return (
        <div className="p-4">
            <button onClick={onBack} className="flex items-center text-indigo-600 mb-4"><ArrowLeft size={18} className="mr-2"/> Back</button>
            <div className="text-left py-8">
                <h2 className="text-5xl font-light">Progress for</h2>
                <h2 className="text-5xl font-semibold">{exerciseName}</h2>
            </div>
             {data.length === 0 ? (
                <p className="text-center text-gray-500">No progress logged for this exercise yet.</p>
             ) : (
                <Card>
                    <SimpleLineChart data={data} title="Weight Progress Over Time" />
                </Card>
             )}
        </div>
    );
};

const MediaManager = ({ exerciseName, onBack }) => {
    const [media, setMedia] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const exerciseMedia = getFromStorage(LOCAL_STORAGE_KEYS.EXERCISE_MEDIA) || {};
        const savedMedia = exerciseMedia[exerciseName];
        if (savedMedia) {
            setMedia({ type: savedMedia.type, base64: savedMedia.base64 });
            setCaption(savedMedia.caption || '');
        }
        setLoading(false);
    }, [exerciseName]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia({
                    type: file.type.split('/')[0],
                    base64: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveMedia = () => {
        if (!media) {
            alert("Please select a file first.");
            return;
        }
        
        const exerciseMedia = getFromStorage(LOCAL_STORAGE_KEYS.EXERCISE_MEDIA) || {};
        exerciseMedia[exerciseName] = {
            type: media.type,
            base64: media.base64,
            caption: caption
        };
        saveToStorage(LOCAL_STORAGE_KEYS.EXERCISE_MEDIA, exerciseMedia);
        
        alert("Media saved!");
        onBack();
    };

    if (loading) return <div className="text-center p-10">Loading media...</div>;

    return (
        <div className="p-4 max-w-lg mx-auto">
            <button onClick={onBack} className="flex items-center text-indigo-600 mb-4"><ArrowLeft size={18} className="mr-2"/> Back</button>
            <div className="text-left py-8">
                <h2 className="text-5xl font-light">Media for</h2>
                <h2 className="text-5xl font-semibold">{exerciseName}</h2>
            </div>
            <Card>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Attach Image/Video</label>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                {media && (
                    <div className="my-4">
                        {media.type === 'image' && <img src={media.base64} alt="Preview" className="rounded-lg max-h-60 mx-auto"/>}
                        {media.type === 'video' && <video src={media.base64} controls className="rounded-lg max-h-60 mx-auto"></video>}
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Caption</label>
                    <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g., Correct Pushup Form" className="w-full p-2 border rounded-md" />
                </div>
                <Button onClick={saveMedia}>Save Media</Button>
            </Card>
        </div>
    );
};

const WorkoutAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [progressData, setProgressData] = useState({});
    const [availableExercises, setAvailableExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState('');

    useEffect(() => {
        const savedLogs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
        setLogs(savedLogs);

        const exerciseProgress = getFromStorage(LOCAL_STORAGE_KEYS.EXERCISE_PROGRESS) || [];
        const groupedProgress = exerciseProgress.reduce((acc, curr) => {
            if (!acc[curr.exerciseName]) {
                acc[curr.exerciseName] = [];
            }
            acc[curr.exerciseName].push({ date: new Date(curr.date).toLocaleDateString('en-ca'), weight: curr.weight });
            return acc;
        }, {});

        for (const exercise in groupedProgress) {
            groupedProgress[exercise].sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        setProgressData(groupedProgress);
        const exercises = Object.keys(groupedProgress);
        setAvailableExercises(exercises);
        if (exercises.length > 0) {
            setSelectedExercise(exercises[0]);
        }

        setLoading(false);
    }, []);

    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const logForDay = logs.find(l => l.date === dateStr);
            let dayClass = "w-10 h-10 flex items-center justify-center rounded-full";
            if (logForDay) {
                if (logForDay.completed) {
                    dayClass += " bg-green-500 text-white";
                } else if (logForDay.skipped) {
                    dayClass += " bg-red-500 text-white";
                }
            }
            days.push(<div key={day} className={dayClass}>{day}</div>);
        }

        return (
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>&lt;</button>
                    <h3 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold">{day}</div>)}
                    {days}
                </div>
            </Card>
        );
    };
    
    const renderProgressChart = () => {
        if (availableExercises.length === 0) {
            return (
                <Card className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-center">Exercise Progress</h3>
                    <p className="text-center text-gray-500">Log some workouts to see your progress!</p>
                </Card>
            );
        }

        return (
            <Card className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-center">Exercise Progress</h3>
                <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4 bg-white"
                >
                    {availableExercises.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                    ))}
                </select>
                <SimpleLineChart
                    data={progressData[selectedExercise] || []}
                    title={`Weight Progress: ${selectedExercise}`}
                />
            </Card>
        );
    };

    if (loading) return <div className="text-center p-10">Loading analytics...</div>;

    return (
        <div className="p-4 space-y-6">
            <div className="text-left py-8">
                <h1 className="text-5xl font-light">Workout</h1>
                <h1 className="text-5xl font-semibold">Analytics</h1>
            </div>
            {renderCalendar()}
            {renderProgressChart()}
        </div>
    );
};


const ProfilePage = ({ onNavigate }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [resetStep, setResetStep] = useState(0);
    const [resetInput, setResetInput] = useState('');
    const [resetType, setResetType] = useState(null); // 'timeline' or 'calorie'
    const importFileRef = useRef(null);

    useEffect(() => {
        const userProfile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE);
        if (userProfile) {
            setProfile(userProfile);
            setName(userProfile.name);
        }
    }, []);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleSaveName = () => {
        if (profile) {
            const updatedProfile = { ...profile, name };
            saveToStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, updatedProfile);
            setProfile(updatedProfile);
            setIsEditing(false);
        }
    };

    const handleExportData = () => {
        const dataToExport = {};
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
            dataToExport[key] = getFromStorage(key);
        });

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataToExport, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "workout_data.json";
        link.click();
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                // Basic validation
                const requiredKeys = Object.values(LOCAL_STORAGE_KEYS);
                const importedKeys = Object.keys(importedData);
                const hasAllKeys = requiredKeys.every(key => importedKeys.includes(key));

                if (!hasAllKeys) {
                    alert("Invalid data file. Some data might be missing.");
                    return;
                }

                // Save data to localStorage
                requiredKeys.forEach(key => {
                    if (importedData[key]) {
                        saveToStorage(key, importedData[key]);
                    }
                });

                alert("Data imported successfully! The app will now reload.");
                window.location.reload();

            } catch (error) {
                console.error("Error importing data:", error);
                alert("Failed to import data. The file might be corrupted.");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (resetType === 'timeline') {
            const logs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
            const resetLogs = logs.map(log => ({ ...log, completed: false }));
            saveToStorage(LOCAL_STORAGE_KEYS.LOGS, resetLogs);
            alert("Workout timeline has been reset!");
            onNavigate('home');
        } else if (resetType === 'calorie') {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.CALORIE_LOGS);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.CUSTOM_FOOD_LIST);
            alert("Calorie data has been reset!");
            onNavigate('calorieCounter');
        }
        setResetStep(0);
        setResetInput('');
        setResetType(null);
    };

    const renderResetModal = () => {
        if (resetStep === 0) return null;

        const resetMessages = {
            timeline: {
                title: "Reset Timeline",
                message: "Are you sure you want to reset your workout timeline? This will mark all your workouts as incomplete and restart your progress from Day 1."
            },
            calorie: {
                title: "Reset Calorie Data",
                message: "Are you sure you want to reset all your calorie data? This will permanently delete all logged food and custom food entries."
            }
        }

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <Card className="w-full max-w-sm">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                        <h3 className="text-lg font-medium text-gray-900 mt-2">{resetMessages[resetType].title}</h3>
                        {resetStep === 1 && (
                            <>
                                <p className="text-sm text-gray-500 mt-2">{resetMessages[resetType].message}</p>
                                <div className="mt-4 flex justify-center gap-4">
                                    <Button onClick={() => setResetStep(0)} variant="secondary">Cancel</Button>
                                    <Button onClick={() => setResetStep(2)} variant="danger">Yes, Reset</Button>
                                </div>
                            </>
                        )}
                        {resetStep === 2 && (
                             <>
                                <p className="text-sm text-gray-500 mt-2">This action cannot be undone. To confirm, please type "RESET" in the box below.</p>
                                <input 
                                    type="text"
                                    value={resetInput}
                                    onChange={(e) => setResetInput(e.target.value)}
                                    className="w-full p-2 border rounded-md mt-4 text-center"
                                />
                                <div className="mt-4 flex justify-center gap-4">
                                     <Button onClick={() => setResetStep(0)} variant="secondary">Cancel</Button>
                                     <Button onClick={handleReset} variant="danger" disabled={resetInput !== 'RESET'}>Confirm Reset</Button>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        );
    };

    if (!profile) {
        return <div className="p-4">Loading profile...</div>;
    }

    return (
        <div className="p-4 max-w-lg mx-auto">
            {renderResetModal()}
            <div className="text-left py-8">
                <h1 className="text-5xl font-light">Your</h1>
                <h1 className="text-5xl font-semibold">Profile</h1>
            </div>

            <Card>
                <div className="flex items-center space-x-4 mb-6">
                    <img 
                        src={profile.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${name.charAt(0)}`} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                    <div className="flex-grow">
                        {isEditing ? (
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="text-2xl font-bold p-2 border rounded-md w-full"
                                />
                                <button onClick={handleSaveName} className="p-2 bg-green-500 text-white rounded-full">
                                    <Save size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-gray-800">
                                    <Edit size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="mt-6">
                <h3 className="text-xl font-bold mb-4">Settings</h3>
                <div className="space-y-4">
                    <Button onClick={() => onNavigate('schedule')} variant="secondary" className="w-full">
                        Customize Workout Plan
                    </Button>
                    <Button onClick={() => onNavigate('calorieCounter')} variant="secondary" className="w-full">
                        Customize Calorie Tracker
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                         <Button onClick={() => {setResetType('timeline'); setResetStep(1);}} variant="lightDanger" className="w-full">
                            Reset Timeline
                        </Button>
                        <Button onClick={() => {setResetType('calorie'); setResetStep(1);}} variant="lightDanger" className="w-full">
                            Reset Calorie Data
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="mt-6">
                <h3 className="text-xl font-bold mb-4">Data Management</h3>
                <div className="space-y-4">
                    <Button onClick={handleExportData} variant="secondary" className="w-full">
                        Export My Data
                    </Button>
                    <Button onClick={() => importFileRef.current.click()} variant="secondary" className="w-full">
                        Import Data
                    </Button>
                    <input 
                        type="file"
                        ref={importFileRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleImportData}
                    />
                </div>
                 <p className="text-xs text-gray-500 mt-4">
                    Importing data will overwrite your current progress. Use with caution.
                </p>
            </Card>
        </div>
    );
};

const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
    const [message, setMessage] = useState("Initializing scanner...");
    const scannerRef = useRef(null);
    const readerId = useMemo(() => "barcode-reader-" + generateId(), []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let html5QrCode;

        const startScanner = () => {
            if (window.Html5Qrcode) {
                html5QrCode = new window.Html5Qrcode(readerId);
                scannerRef.current = html5QrCode;
                setMessage("Requesting camera access...");

                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                
                html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        setMessage(`Fetching data for barcode: ${decodedText}...`);
                        // The success callback will trigger the cleanup via the isOpen change
                        fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.status === 1 && data.product) {
                                    const productName = data.product.product_name || "Unknown Product";
                                    const calories = data.product.nutriments['energy-kcal_100g'] || data.product.nutriments['energy-kcal'] || 0;
                                    onScanSuccess({ name: productName, calories: Math.round(calories) });
                                } else {
                                    alert("Product not found in the database.");
                                    onClose();
                                }
                            })
                            .catch(apiError => {
                                console.error("API Error:", apiError);
                                alert("Could not fetch product data.");
                                onClose();
                            });
                    },
                    (errorMessage) => {
                         if (scannerRef.current?.isScanning && message !== "Scanning for barcode...") {
                             setMessage("Scanning for barcode...");
                        }
                    }
                ).catch(err => {
                    console.error("Error starting scanner:", err);
                    if (String(err).includes("NotAllowedError") || String(err).includes("Permission denied")) {
                        setMessage("Camera access denied. Please allow camera access in your browser settings.");
                    } else {
                        setMessage("Could not start camera. It might be in use by another app.");
                    }
                });
            } else {
                setMessage("Scanner library not loaded.");
            }
        };

        const timer = setTimeout(startScanner, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop()
                    .then(() => console.log("Scanner stopped successfully."))
                    .catch(err => console.error("Failed to stop scanner:", err));
            }
        };
    }, [isOpen, onScanSuccess, onClose, readerId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-center">Scan Barcode</h3>
                <div id={readerId} style={{ width: '100%', minHeight: '300px', border: '1px solid #eee' }}></div>
                <p className="text-center text-gray-600 mt-4 h-10">{message}</p>
                <div className="text-center mt-6">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>
    );
};


const CalorieCounter = ({ scannerScriptStatus }) => {
    const [dailyLog, setDailyLog] = useState({ goal: 2000, foods: [] });
    const [newFood, setNewFood] = useState({ name: '', calories: '' });
    const [scanData, setScanData] = useState(null); // { baseCalories: per 100g, servingSize: in g }
    const [suggestions, setSuggestions] = useState([]);
    const [allFoods, setAllFoods] = useState(FOOD_LIST.map(f => f.name));
    const [customFoods, setCustomFoods] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const suggestionBoxRef = useRef(null);

    const dateToString = (date) => date.toISOString().split('T')[0];

    useEffect(() => {
        const allLogs = getFromStorage(LOCAL_STORAGE_KEYS.CALORIE_LOGS) || {};
        const todayLog = allLogs[dateToString(currentDate)] || { goal: 2000, foods: [] };
        setDailyLog(todayLog);

        let savedCustomFoods = getFromStorage(LOCAL_STORAGE_KEYS.CUSTOM_FOOD_LIST) || [];
        const twentyDaysAgo = new Date();
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

        const recentCustomFoods = savedCustomFoods.filter(food => new Date(food.lastUsed) > twentyDaysAgo);

        if (recentCustomFoods.length !== savedCustomFoods.length) {
            saveToStorage(LOCAL_STORAGE_KEYS.CUSTOM_FOOD_LIST, recentCustomFoods);
        }

        setCustomFoods(recentCustomFoods);
        const combined = [...new Set([...FOOD_LIST.map(f => f.name), ...recentCustomFoods.map(f => f.name)])].sort();
        setAllFoods(combined);
    }, [currentDate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const saveLog = (log) => {
        const allLogs = getFromStorage(LOCAL_STORAGE_KEYS.CALORIE_LOGS) || {};
        allLogs[dateToString(currentDate)] = log;
        saveToStorage(LOCAL_STORAGE_KEYS.CALORIE_LOGS, allLogs);
    };

    const handleGoalChange = (e) => {
        const newGoal = parseInt(e.target.value, 10) || 0;
        const newLog = { ...dailyLog, goal: newGoal };
        setDailyLog(newLog);
        saveLog(newLog);
    };

    const handleFoodNameChange = (e) => {
        const value = e.target.value;
        setNewFood({...newFood, name: value});
        setScanData(null); // Reset scan data on manual name change
        if (value) {
            const filteredSuggestions = allFoods.filter(food => 
                food.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion) => {
        const foodData = FOOD_LIST.find(f => f.name === suggestion);
        setNewFood({
            name: suggestion,
            calories: foodData ? String(foodData.calories) : ''
        });
        setScanData(null);
        setSuggestions([]);
    };

    const handleAddFood = (e) => {
        e.preventDefault();
        if (newFood.name && newFood.calories > 0) {
            const foodNameToAdd = scanData ? `${newFood.name} (${scanData.servingSize}g)` : newFood.name;

            const newLog = {
                ...dailyLog,
                foods: [...dailyLog.foods, { name: foodNameToAdd, calories: newFood.calories, id: generateId() }]
            };
            setDailyLog(newLog);
            saveLog(newLog);

            const foodNameLower = newFood.name.toLowerCase();
            const isPredefined = FOOD_LIST.some(f => f.name.toLowerCase() === foodNameLower);
            
            if (!isPredefined) {
                let updatedCustomFoods = [...customFoods];
                const existingCustomFoodIndex = customFoods.findIndex(f => f.name.toLowerCase() === foodNameLower);

                if (existingCustomFoodIndex > -1) {
                    updatedCustomFoods[existingCustomFoodIndex].lastUsed = dateToString(new Date());
                } else {
                    updatedCustomFoods.push({ name: newFood.name, lastUsed: dateToString(new Date()) });
                }
                
                saveToStorage(LOCAL_STORAGE_KEYS.CUSTOM_FOOD_LIST, updatedCustomFoods);
                setCustomFoods(updatedCustomFoods);
                setAllFoods([...new Set([...FOOD_LIST.map(f => f.name), ...updatedCustomFoods.map(f => f.name)])].sort());
            }

            setNewFood({ name: '', calories: '' });
            setScanData(null);
        }
    };

    const handleRemoveFood = (id) => {
        const newLog = {
            ...dailyLog,
            foods: dailyLog.foods.filter(food => food.id !== id)
        };
        setDailyLog(newLog);
        saveLog(newLog);
    };

    const handleDeleteCustomFood = (foodToDelete) => {
        const updatedCustomFoods = customFoods.filter(food => food.name !== foodToDelete);
        saveToStorage(LOCAL_STORAGE_KEYS.CUSTOM_FOOD_LIST, updatedCustomFoods);
        setCustomFoods(updatedCustomFoods);
        setAllFoods([...new Set([...FOOD_LIST.map(f => f.name), ...updatedCustomFoods.map(f => f.name)])].sort());
        setSuggestions(prev => prev.filter(s => s !== foodToDelete));
    };

    const handleScanSuccess = useCallback((scannedData) => {
        setNewFood({ name: scannedData.name, calories: String(scannedData.calories) });
        setScanData({ baseCalories: scannedData.calories, servingSize: 100 });
        setIsScannerOpen(false);
    }, []);

    const closeScanner = useCallback(() => {
        setIsScannerOpen(false);
    }, []);


    const handleServingSizeChange = (newSize) => {
        if (!scanData) return;
        const newCalories = Math.round((scanData.baseCalories / 100) * newSize);
        setScanData({ ...scanData, servingSize: newSize });
        setNewFood(prevFood => ({ ...prevFood, calories: String(newCalories) }));
    };

    const getServingStep = () => {
        if(scanData && scanData.servingSize > 100) return 10;
        if(scanData && scanData.servingSize > 20) return 5;
        return 1;
    };

    const totalCalories = useMemo(() => {
        return dailyLog.foods.reduce((sum, food) => sum + parseInt(food.calories, 10), 0);
    }, [dailyLog.foods]);

    const remainingCalories = dailyLog.goal - totalCalories;
    const progress = dailyLog.goal > 0 ? (totalCalories / dailyLog.goal) * 100 : 0;
    
    const changeDate = (amount) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + amount);
        setCurrentDate(newDate);
    };
    
    const isScannerReady = scannerScriptStatus === 'ready';

    return (
        <div className="p-4 max-w-lg mx-auto">
            <div className="flex justify-between items-center py-8">
                <div className="text-left">
                    <h1 className="text-5xl font-light">Calorie</h1>
                    <h1 className="text-5xl font-semibold">Tracker</h1>
                </div>
                <button onClick={() => setIsCalendarOpen(true)} className="p-2 rounded-full hover:bg-gray-200">
                    <Calendar size={28} />
                </button>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Daily Goal</h3>
                    <div className="flex items-center">
                        <input 
                            type="number"
                            value={dailyLog.goal}
                            onChange={handleGoalChange}
                            className="w-24 p-2 border rounded-md text-right"
                        />
                        <span className="ml-2">kcal</span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                    <span>Consumed: {totalCalories} kcal</span>
                    <span>Remaining: {remainingCalories} kcal</span>
                </div>
            </Card>
            
            <div className="flex items-center justify-between my-4">
                <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft/></button>
                <span className="text-lg font-semibold">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight/></button>
            </div>

            <Card>
                <h3 className="text-xl font-bold mb-4">Log Food</h3>
                <form onSubmit={handleAddFood} className="flex flex-col gap-4">
                    <div className="relative" ref={suggestionBoxRef}>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text"
                                placeholder="Food name"
                                value={newFood.name}
                                onChange={handleFoodNameChange}
                                className="w-full p-2 border rounded-md"
                            />
                            <button type="button" onClick={() => setIsScannerOpen(true)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50" disabled={!isScannerReady} title={isScannerReady ? "Scan Barcode" : "Scanner loading..."}>
                                <Barcode size={20} />
                            </button>
                        </div>
                        {suggestions.length > 0 && !scanData && (
                            <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-100">
                                        <span onClick={() => handleSuggestionClick(suggestion)} className="flex-grow cursor-pointer">{suggestion}</span>
                                        {customFoods.some(f => f.name === suggestion) && (
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCustomFood(suggestion);
                                                }}
                                                className="p-1 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {scanData && (
                        <div className="p-2 bg-gray-50 rounded-md">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Serving Size (g)</label>
                            <NumberStepper 
                                value={scanData.servingSize}
                                onChange={handleServingSizeChange}
                                step={getServingStep()}
                                min={1}
                            />
                            <p className="text-xs text-center text-gray-400 mt-1">{scanData.baseCalories} kcal per 100g</p>
                        </div>
                    )}

                    <div className="flex gap-2 items-center">
                         <div className="flex-grow">
                             <NumberStepper 
                                value={parseInt(newFood.calories) || 0}
                                onChange={(cals) => setNewFood({...newFood, calories: String(cals)})}
                                step={scanData ? 1 : 10}
                                min={0}
                                disabled={!!scanData}
                            />
                         </div>
                        <button type="submit" className="bg-[#494358] text-white rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center hover:bg-[#5A556B] transition-transform transform hover:scale-105 active:scale-95">
                            <Plus size={24}/>
                        </button>
                    </div>
                </form>
                <div>
                    {dailyLog.foods.length === 0 ? (
                        <p className="text-center text-gray-500">No food logged today.</p>
                    ) : (
                        <ul className="space-y-2">
                            {dailyLog.foods.map(food => (
                                <li key={food.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                                    <span>{food.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span>{food.calories} kcal</span>
                                        <button onClick={() => handleRemoveFood(food.id)} className="text-red-500 hover:text-red-700">
                                            <XCircle size={18}/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Card>
            {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} onDateSelect={(date) => { setCurrentDate(date); setIsCalendarOpen(false); }} />}
            {isScannerReady && <BarcodeScannerModal isOpen={isScannerOpen} onClose={closeScanner} onScanSuccess={handleScanSuccess} />}
        </div>
    );
};

const CalendarModal = ({ onClose, onDateSelect }) => {
    const [date, setDate] = useState(new Date());
    const allLogs = getFromStorage(LOCAL_STORAGE_KEYS.CALORIE_LOGS) || {};

    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthlyCalories = useMemo(() => {
        return Object.entries(allLogs)
            .filter(([dateStr]) => new Date(dateStr).getMonth() === month && new Date(dateStr).getFullYear() === year)
            .reduce((total, [, log]) => total + log.foods.reduce((sum, food) => sum + parseInt(food.calories, 10), 0), 0);
    }, [allLogs, month, year]);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const logForDay = allLogs[dateStr];
        let dayClass = "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer";
        if (logForDay && logForDay.foods.length > 0) {
            dayClass += " bg-green-200";
        }
        days.push(<div key={day} className={dayClass} onClick={() => onDateSelect(new Date(year, month, day))}>{day}</div>);
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}><ChevronLeft/></button>
                    <h3 className="text-xl font-bold">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}><ChevronRight/></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-sm">{day}</div>)}
                    {days}
                </div>
                <div className="mt-4">
                    <h4 className="font-semibold">Monthly Total: {monthlyCalories.toLocaleString()} kcal</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${Math.min((monthlyCalories / (30 * 2000)) * 100, 100)}%`}}></div>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [loading, setLoading] = useState(true);
    const [appState, setAppState] = useState('loading');
    const [navParams, setNavParams] = useState({});
    const scannerScriptStatus = useScript("https://unpkg.com/html5-qrcode");

    useEffect(() => {
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE);
        const workoutPlan = getFromStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN);
        
        if (!profile || !profile.fitnessLevel) {
            setAppState('onboarding');
        } else if (!workoutPlan) {
            setAppState('schedule');
        } else {
            const hasExercises = Object.values(workoutPlan).some(day => day.exercises && day.exercises.length > 0);
            if (!hasExercises) {
                setAppState('schedule');
            } else {
                setAppState('home');
            }
        }
        setLoading(false);
    }, []);

    const handleNavigation = (screen, params = {}) => {
        setNavParams(params);
        setAppState(screen);
    };

    const renderContent = () => {
        if (loading || appState === 'loading') {
            return <div className="flex justify-center items-center h-screen">
                <Dumbbell className="animate-spin h-12 w-12 text-indigo-600" />
            </div>;
        }

        switch (appState) {
            case 'onboarding':
                return <Onboarding onFinish={() => setAppState('home')} />;
            case 'schedule':
                return <ScheduleCreator onScheduleCreated={() => setAppState('home')} />;
            case 'home':
                return <HomeScreen onNavigate={handleNavigation} />;
            case 'dayDetail':
                return <DayDetail logId={navParams.logId} onBack={() => setAppState('home')} onNavigate={handleNavigation} />;
            case 'progressGraph':
                return <ProgressGraph exerciseName={navParams.exerciseName} onBack={() => handleNavigation('dayDetail', { logId: navParams.logId })} />;
            case 'mediaManager':
                 return <MediaManager exerciseName={navParams.exerciseName} onBack={() => handleNavigation('dayDetail', { logId: navParams.logId })} />;
            case 'analytics':
                return <WorkoutAnalytics />;
            case 'calorieCounter':
                return <CalorieCounter scannerScriptStatus={scannerScriptStatus} />;
            case 'profile':
                 return <ProfilePage onNavigate={handleNavigation} />;
            default:
                return <div className="text-center text-red-500">Something went wrong.</div>;
        }
    };

    const NavItem = ({ screen, icon, currentScreen }) => {
        const isActive = screen === currentScreen;
        const [isAnimating, setIsAnimating] = useState(false);
        const prevIsActive = useRef(isActive);

        useEffect(() => {
            // Animate only when changing to active
            if (isActive && !prevIsActive.current) {
                setIsAnimating(true);
                const timer = setTimeout(() => setIsAnimating(false), 400); // Animation duration
                return () => clearTimeout(timer);
            }
            prevIsActive.current = isActive;
        }, [isActive]);


        return (
            <button 
                onClick={() => setAppState(screen)} 
                className="flex-1 flex items-center justify-center group"
            >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-90 ${isActive ? 'bg-white' : 'bg-transparent'}`}>
                    {React.cloneElement(icon, {
                        className: `transition-all duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400'} ${isAnimating ? 'animate-bounce-in' : ''}`
                    })}
                </div>
            </button>
        );
    };

    const showNav = !loading && appState !== 'loading' && appState !== 'onboarding';

    return (
        <div className="bg-gray-50 min-h-screen font-['Poppins']">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
                    @keyframes bounce-in {
                      0% {
                        transform: scale(0.8);
                      }
                      60% {
                        transform: scale(1.2);
                      }
                      100% {
                        transform: scale(1);
                      }
                    }
                    .animate-bounce-in {
                      animation: bounce-in 0.4s ease-out;
                    }
                `}
            </style>
            <main className={`pb-28 transition-all duration-300 ${!showNav ? 'pt-0' : 'pt-4'}`}>
                {renderContent()}
            </main>
            {showNav && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm">
                    <div className="bg-[#494358] rounded-full p-2 flex items-center justify-around">
                        <NavItem screen="home" icon={<LayoutGrid size={24} />} currentScreen={appState} />
                        <NavItem screen="calorieCounter" icon={<Flame size={24} />} currentScreen={appState} />
                        <NavItem screen="analytics" icon={<BarChart2 size={24} />} currentScreen={appState} />
                        <NavItem screen="profile" icon={<User size={24} />} currentScreen={appState} />
                    </div>
                </div>
            )}
        </div>
    );
}
