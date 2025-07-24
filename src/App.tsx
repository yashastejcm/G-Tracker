import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Dumbbell, Calendar, TrendingUp, Image as ImageIcon, CheckCircle, XCircle, Clock, Plus, Trash2, Edit, Save, BarChart2, Search, Undo, Lock, User, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Local Storage Helper Functions ---
const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: 'workout_user_profile',
  WORKOUT_PLAN: 'workout_plan',
  LOGS: 'workout_logs',
  EXERCISE_PROGRESS: 'exercise_progress',
  EXERCISE_MEDIA: 'exercise_media',
  THEME: 'workout_theme',
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

// --- Predefined Exercises ---
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

// --- Helper Components ---
const ConfirmationModal = ({ isOpen, title, children, onConfirm, onDiscard }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm flex flex-col">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{children}</p>
                </div>
                <div className="flex border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onDiscard} className="w-1/2 p-3 text-red-600 dark:text-red-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-bl-lg transition-colors">
                        Discard
                    </button>
                    <button onClick={onConfirm} className="w-1/2 p-3 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-200 dark:border-gray-700 rounded-br-lg transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const OnboardingStepper = ({ currentStep, totalSteps }) => (
    <div className="w-full px-8 mb-8">
        <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className={`h-1 rounded-full flex-1 ${i < currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            ))}
        </div>
    </div>
);


const Card = ({ children, className = '', ...props }) => (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 ${className}`} {...props}>
        {children}
    </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseClasses = 'px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };
    return (
        <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`} disabled={disabled}>
            {children}
        </button>
    );
};

// --- Simple Chart Components ---
const SimpleLineChart = ({ data, title }) => {
    if (!data || data.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-center">No weight progress logged yet.</p>;
    
    const maxWeight = Math.max(...data.map(d => d.weight));
    const minWeight = Math.min(...data.map(d => d.weight));
    const range = maxWeight - minWeight || 1;
    
    return (
        <div className="w-full">
            <h4 className="text-center mb-4 font-semibold dark:text-white">{title}</h4>
            <div className="relative h-40 border border-gray-200 dark:border-gray-700 rounded">
                <svg className="w-full h-full">
                    {data.map((point, index) => {
                        if (index === 0 || data.length < 2) return null;
                        const prevPoint = data[index - 1];
                        const x1 = ((index - 1) / (data.length - 1)) * 100;
                        const x2 = (index / (data.length - 1)) * 100;
                        const y1 = 100 - (((prevPoint.weight - minWeight) / range) * 80 + 10);
                        const y2 = 100 - (((point.weight - minWeight) / range) * 80 + 10);
                        
                        return (
                            <line
                                key={index}
                                x1={`${x1}%`}
                                y1={`${y1}%`}
                                x2={`${x2}%`}
                                y2={`${y2}%`}
                                stroke="#8884d8"
                                strokeWidth="2"
                            />
                        );
                    })}
                    {data.map((point, index) => {
                         if (data.length < 2) return null;
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - (((point.weight - minWeight) / range) * 80 + 10);
                        return (
                            <circle
                                key={index}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r="4"
                                fill="#8884d8"
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
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];
    
    return (
        <div className="w-full">
            <h4 className="text-center mb-4 font-semibold dark:text-white">{title}</h4>
            <div className="grid grid-cols-1 gap-2">
                {data.map((item, index) => {
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div 
                                    className="w-4 h-4 rounded mr-2" 
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                ></div>
                                <span className="text-sm dark:text-gray-300">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold dark:text-gray-200">{percentage}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Onboarding Components ---
const RulerSlider = ({ min, max, value, onChange, unit, colorClass }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const rulerContainerRef = useRef(null);
    const rulerRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startTranslate = useRef(0);

    const TICK_SPACING = 14; 
    const rulerWidth = (max - min) * TICK_SPACING;

    useEffect(() => {
        if (rulerRef.current && rulerContainerRef.current) {
            const containerWidth = rulerContainerRef.current.offsetWidth;
            const initialTranslate = (containerWidth / 2) - ((value - min) * TICK_SPACING);
            rulerRef.current.style.transform = `translateX(${initialTranslate}px)`;
            rulerRef.current.style.transition = 'transform 0.3s ease-out';
        }
    }, [value, min, max, TICK_SPACING]);
    
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleValueChange = (newValue) => {
        const clampedValue = Math.round(Math.max(min, Math.min(max, newValue)));
        if (clampedValue !== value) {
            onChange(clampedValue);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const parsedValue = parseInt(inputValue, 10);
        if (!isNaN(parsedValue)) {
            handleValueChange(parsedValue);
        } else {
            setInputValue(value); 
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    const handleInteractionStart = (clientX) => {
        isDragging.current = true;
        startX.current = clientX;
        if (rulerRef.current) {
            const transformMatrix = window.getComputedStyle(rulerRef.current).getPropertyValue('transform');
            startTranslate.current = transformMatrix !== 'none' ? parseInt(transformMatrix.split(',')[4], 10) : 0;
            rulerRef.current.style.transition = 'none';
        }
    };

    const handleInteractionMove = (clientX) => {
        if (!isDragging.current || !rulerRef.current || !rulerContainerRef.current) return;
        
        const dx = clientX - startX.current;
        const newTranslate = startTranslate.current + dx;
        rulerRef.current.style.transform = `translateX(${newTranslate}px)`;

        const containerWidth = rulerContainerRef.current.offsetWidth;
        const currentValue = min - (newTranslate - containerWidth / 2) / TICK_SPACING;
        handleValueChange(currentValue);
    };

    const handleInteractionEnd = () => {
        isDragging.current = false;
        if (rulerRef.current) {
            rulerRef.current.style.transition = 'transform 0.3s ease-out';
        }
    };

    const rulerMarks = useMemo(() => {
        const marks = [];
        const range = max - min;
        const isSmallRange = range <= 12;

        for (let i = min; i <= max; i++) {
            const isMajorTick = isSmallRange ? true : i % 10 === 0;
            const isMediumTick = !isSmallRange && i % 5 === 0;

            marks.push(
                <div key={i} style={{ position: 'absolute', left: `${(i - min) * TICK_SPACING}px`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {isMajorTick && <span className="absolute text-gray-500 dark:text-gray-400 text-sm" style={{top: '-20px'}}>{i}</span>}
                    <div className={`w-px ${isMajorTick ? 'h-6' : isMediumTick ? 'h-4' : 'h-2'} bg-gray-400 dark:bg-gray-500`}></div>
                </div>
            );
        }
        return marks;
    }, [min, max, TICK_SPACING]);

    return (
        <div className={`${colorClass} rounded-3xl p-8 flex-grow flex flex-col justify-center items-center`}>
            {isEditing ? (
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    className="text-7xl font-bold text-gray-800 dark:text-white bg-transparent w-48 text-center outline-none"
                    autoFocus
                />
            ) : (
                <span onClick={() => setIsEditing(true)} className="text-7xl font-bold text-gray-800 dark:text-white cursor-pointer">{value}</span>
            )}
            <span className="text-lg text-gray-600 dark:text-gray-300">{unit}</span>
            
            <div 
                ref={rulerContainerRef}
                className="w-full h-24 mt-8 relative cursor-grab overflow-hidden select-none"
                onMouseDown={(e) => handleInteractionStart(e.clientX)}
                onMouseMove={(e) => handleInteractionMove(e.clientX)}
                onMouseUp={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleInteractionMove(e.touches[0].clientX)}
                onTouchEnd={handleInteractionEnd}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-1 bg-indigo-900 dark:bg-white rounded-full z-10"></div>
                <div ref={rulerRef} className="absolute top-1/2 -translate-y-1/2 h-6" style={{ width: `${rulerWidth}px` }}>
                    {rulerMarks}
                </div>
            </div>
        </div>
    );
};

const GoalSelector = ({ onNext }) => {
    const goals = ['Back', 'Shoulder', 'Arm', 'Chest', 'Abs', 'Butt', 'Leg', 'Full Body'];
    const [selectedGoals, setSelectedGoals] = useState([]);

    const toggleGoal = (goal) => {
        setSelectedGoals(prev =>
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    };

    const handleNext = () => {
        if (selectedGoals.length === 0) {
            alert("Please select at least one goal.");
            return;
        }
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE) || {};
        profile.goals = selectedGoals;
        saveToStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
        onNext();
    };

    return (
        <div className="text-center p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">What are your goals?</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">This helps us tailor your experience.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {goals.map(goal => (
                    <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`p-4 rounded-lg text-lg font-medium transition-all duration-200 ${selectedGoals.includes(goal) ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        {goal}
                    </button>
                ))}
            </div>
            <div className="flex justify-center">
                 <button onClick={handleNext} disabled={selectedGoals.length === 0} className="bg-indigo-900 text-white rounded-lg px-8 py-3 font-semibold flex items-center justify-center gap-4 disabled:opacity-50">
                    Next <ChevronRight /><ChevronRight />
                </button>
            </div>
        </div>
    );
};

const WeightInput = ({ onNext, onBack, data, setData }) => {
    const handleUnitChange = (newUnit) => {
        if (data.weightUnit === newUnit) return;

        const currentWeight = data.weight;
        let newWeight = currentWeight;
        const KG_TO_LB = 2.20462;

        if (newUnit === 'kg' && data.weightUnit === 'lb') {
            newWeight = Math.round(currentWeight / KG_TO_LB);
        } else if (newUnit === 'lb' && data.weightUnit === 'kg') {
            newWeight = Math.round(currentWeight * KG_TO_LB);
        }
        setData(d => ({...d, weight: newWeight, weightUnit: newUnit}));
    };

    const min = data.weightUnit === 'kg' ? 30 : Math.round(30 * 2.20462);
    const max = data.weightUnit === 'kg' ? 200 : Math.round(200 * 2.20462);

    return (
        <div className="text-center p-4 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">What is your weight?</h1>
            <div className="flex justify-center mb-8">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 flex">
                    <button onClick={() => handleUnitChange('lb')} className={`px-8 py-2 rounded-full font-semibold ${data.weightUnit === 'lb' ? 'bg-white dark:bg-gray-900 text-indigo-900 dark:text-white' : 'text-gray-500'}`}>lb</button>
                    <button onClick={() => handleUnitChange('kg')} className={`px-8 py-2 rounded-full font-semibold ${data.weightUnit === 'kg' ? 'bg-indigo-900 text-white' : 'text-gray-500'}`}>kg</button>
                </div>
            </div>
            <RulerSlider 
                min={min}
                max={max}
                value={data.weight}
                onChange={(newWeight) => setData(d => ({...d, weight: newWeight}))}
                unit={data.weightUnit}
                colorClass="bg-yellow-100 dark:bg-yellow-900/20"
            />
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-5 py-3">
                    <ChevronLeft className="text-gray-800 dark:text-white"/>
                </button>
                <button onClick={onNext} className="bg-indigo-900 text-white rounded-lg px-8 py-3 font-semibold flex items-center justify-center gap-4">
                    Next <ChevronRight /><ChevronRight />
                </button>
            </div>
        </div>
    );
};

const HeightInput = ({ onNext, onBack, data, setData }) => {
    const handleUnitChange = (newUnit) => {
        if (data.heightUnit === newUnit) return;

        const currentHeight = data.height;
        let newHeight = currentHeight;
        const CM_TO_FEET = 0.0328084;
        const FEET_TO_CM = 30.48;

        if (newUnit === 'cm' && data.heightUnit === 'ft') {
            newHeight = Math.round(currentHeight * FEET_TO_CM);
        } else if (newUnit === 'ft' && data.heightUnit === 'cm') {
            newHeight = Math.round(currentHeight * CM_TO_FEET);
        }
        setData(d => ({...d, height: newHeight, heightUnit: newUnit}));
    };

    const min = data.heightUnit === 'cm' ? 120 : 4;
    const max = data.heightUnit === 'cm' ? 220 : 7;

    return (
        <div className="text-center p-4 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">What is your height?</h1>
            <div className="flex justify-center mb-8">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 flex">
                    <button onClick={() => handleUnitChange('ft')} className={`px-8 py-2 rounded-full font-semibold ${data.heightUnit === 'ft' ? 'bg-white dark:bg-gray-900 text-indigo-900 dark:text-white' : 'text-gray-500'}`}>ft</button>
                    <button onClick={() => handleUnitChange('cm')} className={`px-8 py-2 rounded-full font-semibold ${data.heightUnit === 'cm' ? 'bg-indigo-900 text-white' : 'text-gray-500'}`}>cm</button>
                </div>
            </div>
             <RulerSlider 
                min={min}
                max={max}
                value={data.height}
                onChange={(newHeight) => setData(d => ({...d, height: newHeight}))}
                unit={data.heightUnit}
                colorClass="bg-cyan-100 dark:bg-cyan-900/20"
            />
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-5 py-3">
                    <ChevronLeft className="text-gray-800 dark:text-white"/>
                </button>
                <button onClick={onNext} className="bg-indigo-900 text-white rounded-lg px-8 py-3 font-semibold flex items-center justify-center gap-4">
                    Next <ChevronRight /><ChevronRight />
                </button>
            </div>
        </div>
    );
};

const BmiDisplay = ({ onFinish, onBack, data }) => {
    const { bmi, category, color } = useMemo(() => {
        let heightInMeters;
        if (data.heightUnit === 'cm') {
            heightInMeters = data.height / 100;
        } else { // 'ft'
            heightInMeters = data.height * 0.3048;
        }

        let weightInKg;
        if (data.weightUnit === 'kg') {
            weightInKg = data.weight;
        } else { // 'lb'
            weightInKg = data.weight * 0.453592;
        }
        
        if (heightInMeters > 0) {
            const bmiValue = weightInKg / (heightInMeters * heightInMeters);
            const bmiFormatted = bmiValue.toFixed(1);
            let category = '';
            let color = '';
            if (bmiValue < 18.5) {
                category = 'Underweight';
                color = 'bg-blue-300 dark:bg-blue-900/30';
            } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
                category = 'Healthy';
                color = 'bg-green-300 dark:bg-green-900/30';
            } else if (bmiValue >= 25 && bmiValue <= 29.9) {
                category = 'Overweight';
                color = 'bg-yellow-300 dark:bg-yellow-900/30';
            } else {
                category = 'Obesity';
                color = 'bg-red-300 dark:bg-red-900/30';
            }
            return { bmi: bmiFormatted, category, color };
        }
        return { bmi: 'N/A', category: '', color: 'bg-gray-300' };
    }, [data]);

    const handleFinish = () => {
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE) || {};
        profile.metrics = { ...data, bmi };
        saveToStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
        onFinish();
    };

    return (
        <div className="text-center p-4 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Body Mass Index</h1>
            <div className={`${color} rounded-3xl p-8 flex-grow flex flex-col justify-center items-center`}>
                <span className="text-7xl font-bold text-gray-800 dark:text-white">{bmi}</span>
                <span className="text-2xl text-gray-700 dark:text-gray-200 mt-2">{category}</span>
            </div>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-5 py-3">
                    <ChevronLeft className="text-gray-800 dark:text-white"/>
                </button>
                <button onClick={handleFinish} className="bg-indigo-900 text-white rounded-lg px-8 py-3 font-semibold">
                    Start Now
                </button>
            </div>
        </div>
    );
};


const Onboarding = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        weight: 70,
        weightUnit: 'kg',
        height: 170,
        heightUnit: 'cm',
    });

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const steps = [
        <GoalSelector onNext={next} />,
        <WeightInput onNext={next} onBack={back} data={data} setData={setData} />,
        <HeightInput onNext={next} onBack={back} data={data} setData={setData} />,
        <BmiDisplay onFinish={onFinish} onBack={back} data={data} />,
    ];

    return (
        <div className="w-full max-w-md mx-auto mt-8 h-[80vh] flex flex-col">
            <OnboardingStepper currentStep={step + 1} totalSteps={steps.length} />
            <div className="flex-grow">
                {steps[step]}
            </div>
        </div>
    );
};

const ProfileScreen = ({ theme, setTheme }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleThemeToggle = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const logs = getFromStorage(LOCAL_STORAGE_KEYS.LOGS) || [];
        const completedLogs = logs.filter(log => log.completed);

        if (completedLogs.length === 0) {
            setAnalyticsData(null);
            setLoading(false);
            return;
        }

        const totalVolume = completedLogs.reduce((total, log) => 
            total + log.exercises.reduce((exTotal, ex) => 
                exTotal + (ex.sets ? ex.sets.reduce((setTotal, set) => setTotal + (set.reps * set.weight), 0) : 0)
            , 0)
        , 0);

        const muscleCounts = completedLogs.reduce((acc, log) => {
            log.exercises.forEach(ex => {
                if(!ex.skipped){
                    const muscle = ex.muscle || 'Other';
                    acc[muscle] = (acc[muscle] || 0) + 1;
                }
            });
            return acc;
        }, {});
        const muscleFrequencyData = Object.entries(muscleCounts).map(([name, value]) => ({ name, value }));
        
        const exerciseProgress = getFromStorage(LOCAL_STORAGE_KEYS.EXERCISE_PROGRESS) || [];
        const weightProgress = exerciseProgress.reduce((acc, curr) => {
            if (!acc[curr.exerciseName]) {
                acc[curr.exerciseName] = [];
            }
            acc[curr.exerciseName].push({ date: curr.date, weight: curr.weight });
            return acc;
        }, {});

        setAnalyticsData({
            totalVolume,
            weightProgress,
            muscleFrequencyData
        });
        setLoading(false);
    }, []);

    return (
        <div className="p-4 space-y-6 relative">
             <button 
                onClick={handleThemeToggle} 
                className="absolute top-5 right-5 z-10 bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-xl"
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <h1 className="text-3xl font-bold dark:text-white">Profile & Stats</h1>
            
            {loading && <div className="text-center p-10 dark:text-white">Loading analytics...</div>}
            {!loading && !analyticsData && <div className="text-center p-10 dark:text-white">No workout data available to generate analytics.</div>}
            {!loading && analyticsData && (
                <>
                    <Card>
                        <h2 className="text-xl font-bold mb-2 dark:text-white">Total Volume Lifted</h2>
                        <p className="text-4xl font-bold text-indigo-600">{analyticsData.totalVolume.toLocaleString(undefined, {maximumFractionDigits: 0})} kg</p>
                        <p className="text-gray-500 dark:text-gray-400">Total weight lifted across all workouts.</p>
                    </Card>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SimplePieChart data={analyticsData.muscleFrequencyData} title="Muscle Group Frequency" />
                        </Card>
                        {analyticsData.weightProgress && Object.keys(analyticsData.weightProgress).length > 0 &&
                            <Card>
                                <SimpleLineChart 
                                    data={analyticsData.weightProgress[Object.keys(analyticsData.weightProgress)[0]]} 
                                    title={`Weight Progress: ${Object.keys(analyticsData.weightProgress)[0]}`} 
                                />
                            </Card>
                        }
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [appState, setAppState] = useState('loading');
    const [navParams, setNavParams] = useState({});
    const [theme, setTheme] = useState(() => getFromStorage(LOCAL_STORAGE_KEYS.THEME) || 'light');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [navAttempt, setNavAttempt] = useState({ showModal: false, nextScreen: null });
    const saveScheduleRef = useRef(null);
    const revertScheduleChangesRef = useRef(null);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark';
        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(theme);
        saveToStorage(LOCAL_STORAGE_KEYS.THEME, theme);
    }, [theme]);

    useEffect(() => {
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE);
        if (profile && profile.metrics) {
            const workoutPlan = getFromStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN);
            if (!workoutPlan || !Object.values(workoutPlan).some(day => day.exercises && day.exercises.length > 0)) {
                setAppState('schedule');
            } else {
                setAppState('home');
            }
        } else {
            setAppState('onboarding');
        }
    }, []);

    const handleOnboardingFinish = () => {
        setAppState('schedule');
    };

    const handleNavigation = (screen, params = {}) => {
        setNavParams(params);
        setAppState(screen);
    };

    const handleNavAttempt = (screen) => {
        if (appState === 'schedule' && hasUnsavedChanges && screen !== 'schedule') {
            setNavAttempt({ showModal: true, nextScreen: screen });
        } else {
            setAppState(screen);
        }
    };

    const handleModalConfirm = () => {
        if (saveScheduleRef.current) {
            saveScheduleRef.current(); // This will save and also set hasUnsavedChanges to false
        }
        setAppState(navAttempt.nextScreen);
        setNavAttempt({ showModal: false, nextScreen: null });
    };

    const handleModalDiscard = () => {
        if (revertScheduleChangesRef.current) {
            revertScheduleChangesRef.current(); // This will revert and set hasUnsavedChanges to false
        }
        setAppState(navAttempt.nextScreen);
        setNavAttempt({ showModal: false, nextScreen: null });
    };

    const renderContent = () => {
        if (appState === 'loading') {
            return <div className="flex justify-center items-center h-screen">
                <Dumbbell className="animate-spin h-12 w-12 text-indigo-600" />
            </div>;
        }

        if (appState === 'onboarding') {
            return <Onboarding onFinish={handleOnboardingFinish} />;
        }
        
        switch (appState) {
            case 'schedule':
                return <ScheduleCreator 
                    onScheduleCreated={() => setAppState('home')} 
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    saveScheduleRef={saveScheduleRef}
                    revertChangesRef={revertScheduleChangesRef}
                />;
            case 'home':
                return <HomeScreen onNavigate={handleNavigation} />;
            case 'dayDetail':
                return <DayDetail logId={navParams.logId} onBack={() => setAppState('home')} onNavigate={handleNavigation} />;
            case 'exerciseDetailAnalytics':
                return <ExerciseDetailAnalytics exerciseName={navParams.exerciseName} onBack={() => handleNavigation('dayDetail', { logId: navParams.logId })} />;
            case 'mediaManager':
                 return <MediaManager exerciseName={navParams.exerciseName} logDate={navParams.logDate} onBack={() => handleNavigation('dayDetail', { logId: navParams.logId })} />;
            case 'profile':
                return <ProfileScreen theme={theme} setTheme={setTheme} />;
            default:
                return <HomeScreen onNavigate={handleNavigation} />;
        }
    };

    const NavItem = ({ screen, icon, label }) => (
        <button onClick={() => handleNavAttempt(screen)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full ${appState === screen ? 'text-indigo-600 bg-indigo-100 dark:bg-gray-700 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
    
    const showNav = appState !== 'loading' && appState !== 'onboarding';

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@400;500;600;700&display=swap');
                    body, .font-sans {
                        font-family: 'Montserrat Alternates', sans-serif;
                    }
                `}
            </style>
            <main className={`pb-20 transition-all duration-300 ${!showNav ? 'pt-0' : 'pt-4'}`}>
                {renderContent()}
            </main>
            {showNav && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-1 sm:gap-2 p-1">
                        <NavItem screen="schedule" icon={<Edit size={24} />} label="Plan" />
                        <NavItem screen="home" icon={<Calendar size={24} />} label="Timeline" />
                        <NavItem screen="profile" icon={<User size={24} />} label="Profile" />
                    </div>
                </nav>
            )}
            <ConfirmationModal
                isOpen={navAttempt.showModal}
                title="Update Schedule?"
                onConfirm={handleModalConfirm}
                onDiscard={handleModalDiscard}
            >
                You have unsaved changes in your weekly plan. Do you want to save them before leaving?
            </ConfirmationModal>
        </div>
    );
}
