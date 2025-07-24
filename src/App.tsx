import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Dumbbell, Calendar, Target, TrendingUp, Image as ImageIcon, CheckCircle, XCircle, Clock, Plus, Trash2, Edit, Save, BarChart2, Search, Undo, Lock } from 'lucide-react';

// --- Local Storage Helper Functions ---
const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: 'workout_user_profile',
  WORKOUT_PLAN: 'workout_plan',
  LOGS: 'workout_logs',
  EXERCISE_PROGRESS: 'exercise_progress',
  EXERCISE_MEDIA: 'exercise_media'
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
const Stepper = ({ currentStep, totalSteps }) => (
    <div className="w-full px-4 sm:px-8 mb-6">
        <div className="flex items-center">
            {Array.from({ length: totalSteps }, (_, i) => (
                <React.Fragment key={i}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${i <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {i < currentStep ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    {i < totalSteps - 1 && <div className={`flex-auto border-t-2 transition-all duration-500 ${i < currentStep ? 'border-indigo-600' : 'border-gray-200'}`}></div>}
                </React.Fragment>
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
                                stroke="#8884d8"
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">What's your goal?</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Pick as many as you want. This will help tailor your plan.</p>
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
            <Button onClick={handleNext} disabled={selectedGoals.length === 0}>Next</Button>
        </div>
    );
};

const BodyMetrics = ({ onNext }) => {
    const [height, setHeight] = useState({ feet: 5, inches: 7 });
    const [weight, setWeight] = useState(70);
    const [bmi, setBmi] = useState(null);
    const [bmiCategory, setBmiCategory] = useState('');

    const calculateBmi = useCallback(() => {
        const heightInMeters = ((height.feet * 12) + height.inches) * 0.0254;
        if (heightInMeters > 0) {
            const bmiValue = weight / (heightInMeters * heightInMeters);
            setBmi(bmiValue.toFixed(1));
            if (bmiValue < 18.5) setBmiCategory('Needs attention');
            else if (bmiValue >= 18.5 && bmiValue <= 24.9) setBmiCategory('Healthy!');
            else setBmiCategory('Needs attention');
        }
    }, [height, weight]);

    useEffect(() => {
        calculateBmi();
    }, [calculateBmi]);

    const handleNext = () => {
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE) || {};
        profile.metrics = { height, weight, bmi: bmi || 0 };
        saveToStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
        onNext();
    };

    const getBmiColor = () => {
        if (!bmi) return 'bg-gray-400';
        if (bmi < 18.5 || bmi > 24.9) return 'bg-red-500';
        return 'bg-green-500';
    };

    return (
        <div className="p-4 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Your Physical Details</h1>
            <Card className="w-full max-w-md">
                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Height</label>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Feet</label>
                            <input type="number" value={height.feet} onChange={e => setHeight(h => ({ ...h, feet: parseInt(e.target.value) || 0 }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Inches</label>
                            <input type="number" value={height.inches} onChange={e => setHeight(h => ({ ...h, inches: parseInt(e.target.value) || 0 }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>
                </div>
                <div className="mb-8">
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Weight: {weight} kg</label>
                    <input type="range" min="30" max="200" value={weight} onChange={e => setWeight(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                {bmi && (
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your BMI: {bmi}</h2>
                        <div className="w-full bg-gray-200 rounded-full h-4 my-2 dark:bg-gray-700">
                            <div className={`${getBmiColor()} h-4 rounded-full`} style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }}></div>
                        </div>
                        <p className={`font-bold ${getBmiColor().replace('bg-', 'text-')}`}>{bmiCategory}</p>
                    </div>
                )}
            </Card>
            <Button onClick={handleNext} className="mt-8">Next</Button>
        </div>
    );
};

const Onboarding = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const steps = [
        <GoalSelector onNext={() => setStep(1)} />,
        <BodyMetrics onNext={onFinish} />,
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <Stepper currentStep={step} totalSteps={steps.length} />
            {steps[step]}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold dark:text-white">Add Exercises</h2>
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
                                className="w-full p-2 pl-10 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <select 
                            value={muscleFilter} 
                            onChange={e => setMuscleFilter(e.target.value)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-grow">
                    <ul className="space-y-2">
                        {filteredExercises.map(ex => (
                            <li key={ex.name} onClick={() => toggleExerciseSelection(ex)} className={`p-3 rounded-md cursor-pointer flex justify-between items-center transition-colors ${selectedExercises.some(e => e.name === ex.name) ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <div>
                                    <span className="font-semibold dark:text-white">{ex.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{ex.muscle}</span>
                                </div>
                                <input type="checkbox" readOnly checked={selectedExercises.some(e => e.name === ex.name)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
                            </li>
                        ))}
                    </ul>
                     <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <input
                            type="text"
                            placeholder="Or add a custom exercise"
                            value={customExercise}
                            onChange={e => setCustomExercise(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-4">
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

        // Clear existing logs and create new ones
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
                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-center">Editing {editingDay}</h2>
                    <Card>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Custom Day Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Chest & Triceps"
                                value={workoutPlan[editingDay].name}
                                onChange={(e) => handleDayNameChange(editingDay, e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="mb-4 h-px bg-gray-200 dark:bg-gray-700"></div>
                        {workoutPlan[editingDay].exercises.length === 0 ? (
                             <p className="text-center text-gray-500 dark:text-gray-400">No exercises added yet.</p>
                        ) : (
                            <div className="mb-4 space-y-2">
                                {workoutPlan[editingDay].exercises.map((ex, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        <span className="dark:text-gray-200">{ex.name}</span>
                                        <button onClick={() => removeExercise(editingDay, index)} className="text-red-500 hover:text-red-700">
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
                            <Button onClick={() => setEditingDay(null)} className="w-full bg-green-500 hover:bg-green-600 focus:ring-green-500">
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
            <h1 className="text-3xl font-bold text-center mb-2 dark:text-white">Your Weekly Plan</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Tap a day to add or edit exercises. This will reset your timeline.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {days.map(day => (
                    <Card key={day} className="cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setEditingDay(day)}>
                        <h3 className="font-bold text-xl mb-2 dark:text-white">{day}</h3>
                        <p className="text-indigo-500 font-semibold truncate mb-2">{workoutPlan[day].name || '...'}</p>
                        {workoutPlan[day].exercises && workoutPlan[day].exercises.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                {workoutPlan[day].exercises.slice(0,2).map((ex, i) => <li key={i}>{ex.name}</li>)}
                                {workoutPlan[day].exercises.length > 2 && <li>...</li>}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Rest Day</p>
                        )}
                        <div className="text-indigo-500 font-semibold mt-4 flex items-center">Edit Day <Edit size={16} className="ml-2" /></div>
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
        const sortedLogs = [...logs].sort((a, b) => parseInt(a.day) - parseInt(b.day));
        const activeLog = sortedLogs.find(l => !l.completed);

        return sortedLogs.map(log => {
            const isRestDay = !log.exercises || log.exercises.length === 0;
            const name = getDayName(log);
            
            let status = 'locked';
            if (log.completed) {
                status = 'completed';
            } else if (activeLog && log.id === activeLog.id) {
                status = 'current';
            }
            
            return {
                dayKey: `Day ${log.day}`,
                name,
                isRestDay,
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
        return <div className="text-center p-10 dark:text-white">Loading your timeline...</div>;
    }

    if (timelineDays.length === 0) {
        return (
             <div className="text-center p-10">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Welcome!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't set up a schedule yet. Let's create one!</p>
                <Button onClick={() => onNavigate('schedule')}>Create Schedule</Button>
            </div>
        )
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Workout Timeline</h1>
            <div className="space-y-4">
                {timelineDays.map((day, index) => {
                    const cardRef = el => itemRefs.current[index] = el;

                    if (day.status === 'current') {
                        return (
                            <div ref={cardRef} key={day.dayKey} className="bg-indigo-600 text-white rounded-xl shadow-lg p-4 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-2xl">{day.dayKey}</h2>
                                    <p className="opacity-90">{day.name}</p>
                                    <p className="text-sm opacity-70 mt-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                                {!day.isRestDay && (
                                    <button onClick={() => onNavigate('dayDetail', { logId: day.logId })} className="bg-white text-indigo-600 font-bold py-2 px-5 rounded-lg shadow-md hover:bg-gray-200">
                                        Start
                                    </button>
                                )}
                            </div>
                        );
                    }
                    
                    const isClickable = day.status === 'completed' && day.logId;
                    return (
                        <div ref={cardRef} key={day.dayKey} onClick={() => isClickable && onNavigate('dayDetail', { logId: day.logId })} className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex justify-between items-center ${day.status === 'completed' ? 'opacity-50' : ''} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}>
                            <div>
                                <h2 className="font-bold text-2xl dark:text-white">{day.dayKey}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{day.name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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

    if (loading) return <div className="text-center p-10 dark:text-white">Loading exercises...</div>;
    if (!log) return <div className="text-center p-10 text-red-500">Could not load workout details.</div>;

    const allExercisesHandled = log.exercises.every(ex => (ex.sets && ex.sets.length > 0) || ex.skipped);

    return (
        <div className="p-4">
            <button onClick={onBack} className="flex items-center text-indigo-600 mb-4"><ArrowLeft size={18} className="mr-2"/> Back to Timeline</button>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Day {log.day} Workout</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="space-y-4">
                {log.exercises.map((ex, exerciseIndex) => (
                    <Card key={exerciseIndex} className={`transition-opacity ${ex.skipped ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex justify-between items-start">
                             <h3 className={`text-xl font-bold mb-3 dark:text-white ${ex.skipped ? 'line-through' : ''}`}>{ex.name}</h3>
                             <div className="flex items-center space-x-2">
                                <button onClick={() => onNavigate('progressGraph', { exerciseName: ex.name, logId: log.id })} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                                    <BarChart2 size={20} />
                                </button>
                                <button onClick={() => onNavigate('mediaManager', { exerciseName: ex.name, logId: log.id })} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                                    <ImageIcon size={20} />
                                </button>
                             </div>
                        </div>
                       
                        {!ex.skipped && (
                            <>
                                <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <div className="col-span-2">Set</div>
                                    <div className="col-span-4">Weight (kg)</div>
                                    <div className="col-span-4">Reps</div>
                                    <div className="col-span-2"></div>
                                </div>

                                <div className="space-y-2">
                                    {ex.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-2 text-center font-medium dark:text-white">{setIndex + 1}</div>
                                            <div className="col-span-4">
                                                <input type="number" step="0.5" value={set.weight} onChange={e => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                            </div>
                                            <div className="col-span-4">
                                                <input type="number" value={set.reps} onChange={e => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <button onClick={() => removeSet(exerciseIndex, setIndex)} className="text-red-500 hover:text-red-700 p-2">
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
                                <button onClick={() => toggleSkipExercise(exerciseIndex)} className="bg-red-500 text-white rounded-lg px-4 py-2 font-semibold shadow-md hover:bg-red-600">
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
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                            <textarea value={ex.notes || ''} onChange={e => handleNoteChange(exerciseIndex, e.target.value)} rows="2" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., 'Felt strong today'"></textarea>
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

    if (loading) return <div className="text-center p-10 dark:text-white">Loading graph...</div>;
    
    return (
        <div className="p-4">
            <button onClick={onBack} className="flex items-center text-indigo-600 mb-4"><ArrowLeft size={18} className="mr-2"/> Back</button>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Progress for {exerciseName}</h2>
             {data.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No progress logged for this exercise yet.</p>
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

    if (loading) return <div className="text-center p-10 dark:text-white">Loading media...</div>;

    return (
        <div className="p-4 max-w-lg mx-auto">
            <button onClick={onBack} className="flex items-center text-indigo-600 mb-4"><ArrowLeft size={18} className="mr-2"/> Back</button>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Media for {exerciseName}</h2>
            <Card>
                <div className="mb-4">
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Attach Image/Video</label>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                {media && (
                    <div className="my-4">
                        {media.type === 'image' && <img src={media.base64} alt="Preview" className="rounded-lg max-h-60 mx-auto"/>}
                        {media.type === 'video' && <video src={media.base64} controls className="rounded-lg max-h-60 mx-auto"></video>}
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Caption</label>
                    <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g., Correct Pushup Form" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <Button onClick={saveMedia}>Save Media</Button>
            </Card>
        </div>
    );
};

const WorkoutAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="text-center p-10 dark:text-white">Loading analytics...</div>;
    if (!analyticsData) return <div className="text-center p-10 dark:text-white">No workout data available to generate analytics.</div>;

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold dark:text-white">Workout Analytics</h1>
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
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [loading, setLoading] = useState(true);
    const [appState, setAppState] = useState('loading');
    const [navParams, setNavParams] = useState({});

    useEffect(() => {
        const profile = getFromStorage(LOCAL_STORAGE_KEYS.USER_PROFILE);
        const workoutPlan = getFromStorage(LOCAL_STORAGE_KEYS.WORKOUT_PLAN);
        
        if (!profile || !profile.metrics) {
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
            return <div className="flex justify-center items-center h-screen dark:text-white">
                <Dumbbell className="animate-spin h-12 w-12 text-indigo-600" />
            </div>;
        }

        switch (appState) {
            case 'onboarding':
                return <Onboarding onFinish={() => setAppState('schedule')} />;
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
            default:
                return <div className="text-center text-red-500">Something went wrong.</div>;
        }
    };

    const NavItem = ({ screen, icon, label }) => (
        <button onClick={() => setAppState(screen)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full ${appState === screen ? 'text-indigo-600 bg-indigo-100 dark:bg-gray-700' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );

    const showNav = !loading && appState !== 'loading' && appState !== 'onboarding';

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <main className={`pb-20 transition-all duration-300 ${!showNav ? 'pt-0' : 'pt-4'}`}>
                {renderContent()}
            </main>
            {showNav && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-1 sm:gap-2 p-1">
                        <NavItem screen="home" icon={<Calendar size={24} />} label="Timeline" />
                        <NavItem screen="schedule" icon={<Edit size={24} />} label="Plan" />
                        <NavItem screen="analytics" icon={<TrendingUp size={24} />} label="Stats" />
                    </div>
                </nav>
            )}
        </div>
    );
}
