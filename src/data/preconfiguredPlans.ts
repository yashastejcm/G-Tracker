// --- Predefined Exercises ---
export const EXERCISE_LIST = [
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

export const generateWorkoutPlan = (level, days, excludeLegs = false) => {
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

