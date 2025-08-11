import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * React Fitness App (Single File) — v27.7
 * ------------------------------------------------------------
 * Single-page app with:
 * - Onboarding → Schedule Setup → Home Timeline → Day Logging → Analytics → Calorie Tracker → Profile/Data
 * - LocalStorage persistence with safe helpers & migrations
 * - Version banner, floating tab bar, Poppins, lucide-react icons (fallback emoji if not available)
 * - Lightweight SVG charts (SimpleLineChart), calendar heatmap, barcode scan stub
 *
 * NOTE: This is a production-style single-file starter that you can split into modules later.
 * All styling uses Tailwind utility classes; shadcn/ui can be introduced if you prefer.
 */

// ----------------------------
// Constants & Keys
// ----------------------------
const LATEST_APP_VERSION = "27.7";
const LS_KEYS = {
  USER_PROFILE: "USER_PROFILE",
  WORKOUT_PLAN: "WORKOUT_PLAN",
  LOGS: "LOGS",
  EXERCISE_PROGRESS: "EXERCISE_PROGRESS",
  EXERCISE_MEDIA: "EXERCISE_MEDIA",
  CALORIE_LOGS: "CALORIE_LOGS",
  CUSTOM_FOOD_LIST: "CUSTOM_FOOD_LIST",
  APP_VERSION: "APP_VERSION",
};

// ----------------------------
// Utilities
// ----------------------------
function getFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("getFromStorage error", key, e);
    return fallback;
  }
}
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("saveToStorage error", key, e);
    return false;
  }
}
function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function kgToLb(kg) { return kg * 2.20462; }
function lbToKg(lb) { return lb / 2.20462; }
function cmToIn(cm) { return cm / 2.54; }
function ftInToCm(ft, inch) { return (ft * 12 + inch) * 2.54; }

// ----------------------------
// Minimal Reference Data (expand as needed)
// ----------------------------
const EXERCISE_LIST = [
  // Chest
  { name: "Barbell Bench Press", muscles: ["Chest"], type: "compound" },
  { name: "Incline Dumbbell Press", muscles: ["Chest"], type: "compound" },
  { name: "Cable Fly", muscles: ["Chest"], type: "isolation" },
  // Back
  { name: "Deadlift", muscles: ["Back"], type: "compound" },
  { name: "Lat Pulldown", muscles: ["Back"], type: "compound" },
  { name: "Seated Row", muscles: ["Back"], type: "compound" },
  // Shoulders
  { name: "Overhead Press", muscles: ["Shoulder"], type: "compound" },
  { name: "Lateral Raise", muscles: ["Shoulder"], type: "isolation" },
  // Arms
  { name: "Barbell Curl", muscles: ["Arm"], type: "isolation" },
  { name: "Triceps Pushdown", muscles: ["Arm"], type: "isolation" },
  // Legs
  { name: "Back Squat", muscles: ["Leg"], type: "compound" },
  { name: "Romanian Deadlift", muscles: ["Leg"], type: "compound" },
  { name: "Leg Extension", muscles: ["Leg"], type: "isolation" },
  // Butt
  { name: "Hip Thrust", muscles: ["Butt"], type: "compound" },
  // Abs
  { name: "Hanging Leg Raise", muscles: ["Abs"], type: "isolation" },
  { name: "Cable Crunch", muscles: ["Abs"], type: "isolation" },
];

const FOOD_LIST = [
  { name: "roti (1)", kcal: 80 },
  { name: "dal (1 bowl)", kcal: 180 },
  { name: "dosa (1)", kcal: 160 },
  { name: "idli (2)", kcal: 140 },
  { name: "biryani (1 plate)", kcal: 550 },
  { name: "banana (1)", kcal: 105 },
  { name: "almonds (10)", kcal: 70 },
  { name: "pasta (1 cup)", kcal: 220 },
  { name: "burger (1)", kcal: 350 },
  { name: "protein shake (1 scoop)", kcal: 120 },
];

// ----------------------------
// Reusable UI Primitives
// ----------------------------
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl shadow-sm border border-gray-200 bg-white ${className}`}>{children}</div>
);
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const base = "px-4 py-2 rounded-xl transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    lightDanger: "bg-red-50 text-red-700 hover:bg-red-100",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

function NumberStepper({ value, setValue, min = -9999, max = 9999, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={() => setValue(v => clamp((v ?? 0) - step, min, max))}>−</Button>
      <div className="min-w-[64px] text-center font-medium">{value ?? 0}</div>
      <Button variant="secondary" onClick={() => setValue(v => clamp((v ?? 0) + step, min, max))}>+</Button>
    </div>
  );
}

function SimpleLineChart({ data = [], width = 320, height = 120, strokeWidth = 2, accessor = d => d }) {
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const values = data.map(accessor);
  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * innerW + padding;
    const y = height - padding - ((v - minV) / Math.max(maxV - minV, 1)) * innerH;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="w-full">
      <polyline fill="none" stroke="currentColor" strokeWidth={strokeWidth} points={points} />
    </svg>
  );
}

// ----------------------------
// Storage Shapes
// ----------------------------
const defaultProfile = {
  id: "user",
  name: "",
  age: "",
  gender: "",
  photo: "", // dataURL
  heightCm: 170,
  weightKg: 70,
  heightHistory: [], // {date, cm}
  weightHistory: [], // {date, kg}
  goalDailyCalories: 2000,
};

// WORKOUT_PLAN: { days: [ { id, name, exercises: [string] } ], level, daysCount, excludeLegs }
// LOG entry: { id, dayIndex, date, title, exercises: [{ name, sets: [{ reps, weight }], skipped, notes }], completed }

// ----------------------------
// Generators
// ----------------------------
function generateWorkoutPlan(level = "Beginner", days = 3, excludeLegs = false) {
  const musclesByDay = {
    Beginner: [["Chest","Back"],["Shoulder","Arm"],["Leg","Butt"],["Abs"],["Chest","Arm"],["Back","Shoulder"],["Leg","Abs"]],
    Intermediate: [["Chest"],["Back"],["Shoulder"],["Arm"],["Leg","Butt"],["Abs"],["Chest","Back"]],
    Advanced: [["Chest"],["Back"],["Shoulder"],["Arm"],["Leg"],["Abs"],["Butt"]],
  };
  const picked = musclesByDay[level].slice(0, days);
  const daysArr = picked.map((groups, idx) => {
    const pool = EXERCISE_LIST.filter(e => e.muscles.some(m => groups.includes(m)) && (!excludeLegs || (!e.muscles.includes("Leg") && !e.muscles.includes("Butt"))));
    const uniqNames = Array.from(new Set(pool.map(p => p.name)));
    const five = uniqNames.slice(0, 5);
    return { id: generateId("day"), name: `Day ${idx+1}`, exercises: five };
  });
  return { level, daysCount: days, excludeLegs, days: daysArr };
}

function buildInitialLogs(plan, startDateISO = todayISO()) {
  const logs = [];
  const start = new Date(startDateISO);
  for (let i = 0; i < plan.days.length; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const exercises = plan.days[i].exercises.map(name => ({ name, sets: [{ reps: 10, weight: 10 }], skipped: false, notes: "" }));
    logs.push({
      id: generateId("log"),
      dayIndex: i+1,
      date: d.toISOString().slice(0,10),
      title: plan.days[i].name,
      exercises,
      completed: false,
    });
  }
  return logs;
}

// ----------------------------
// Version Banner
// ----------------------------
function VersionBanner({ currentVersion, onUpdateNow, onLater }) {
  return (
    <Card className="fixed z-50 bottom-24 left-4 right-4 p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">New Version Available</div>
        <div className="text-lg font-semibold">You have {currentVersion ?? "unknown"}. Update to {LATEST_APP_VERSION}?</div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onLater} variant="secondary">Later</Button>
        <Button onClick={onUpdateNow} variant="primary">Update Now</Button>
      </div>
    </Card>
  );
}

// ----------------------------
// Bottom Tab Bar
// ----------------------------
const tabs = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "calories", label: "Calorie", icon: "🔥" },
  { key: "analytics", label: "Analytics", icon: "📈" },
  { key: "profile", label: "Profile", icon: "👤" },
];
function TabBar({ active, onChange }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-lg px-3 py-2 flex items-center justify-around">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} className="relative px-3 py-2 flex flex-col items-center gap-1">
          <span className={`text-xl ${active===t.key? "animate-[bounce-in_300ms_ease]" : ""}`}>{t.icon}</span>
          <span className={`text-xs ${active===t.key? "font-semibold" : "text-gray-500"}`}>{t.label}</span>
          {active===t.key && <span className="absolute -top-1 right-2 w-2 h-2 bg-black rounded-full"></span>}
        </button>
      ))}
    </div>
  );
}

// ----------------------------
// Onboarding
// ----------------------------
function ProfileSetup({ initial, onNext }) {
  const [name, setName] = useState(initial.name || "");
  const [age, setAge] = useState(initial.age || "");
  const [gender, setGender] = useState(initial.gender || "");
  const [photo, setPhoto] = useState(initial.photo || "");
  const valid = name && age && gender;

  function onPhotoChange(e){
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border">
          {photo ? <img src={photo} alt="avatar" className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center text-gray-400">📷</div>}
        </div>
        <label className="text-sm">
          <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange}/>
          <span className="underline cursor-pointer">Upload Photo</span>
        </label>
      </div>
      <div className="grid gap-2">
        <input className="border rounded-xl px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Age" value={age} onChange={e=>setAge(e.target.value)} />
        <select className="border rounded-xl px-3 py-2" value={gender} onChange={e=>setGender(e.target.value)}>
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>
      <Button disabled={!valid} onClick={()=> onNext({ name, age, gender, photo })}>Next</Button>
    </div>
  )
}

function WeightSelector({ initialKg = 70, onNext }){
  const [unit, setUnit] = useState("kg");
  const [val, setVal] = useState(initialKg);
  const display = unit==="kg"? val : Math.round(kgToLb(val));
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["kg","lb"]).map(u=> (
          <Button key={u} variant={unit===u?"primary":"secondary"} onClick={()=>setUnit(u)}>{u.toUpperCase()}</Button>
        ))}
      </div>
      <div className="text-5xl font-bold">{display}</div>
      <NumberStepper value={display} setValue={(nv)=> setVal(unit==="kg"? nv : lbToKg(nv))} step={1}/>
      <Button onClick={()=> onNext(val)}>Next</Button>
    </div>
  );
}

function HeightSelector({ initialCm = 170, onNext }){
  const [unit, setUnit] = useState("cm");
  const [cm, setCm] = useState(initialCm);
  const totalIn = cmToIn(cm);
  const ft = Math.floor(totalIn/12);
  const inch = Math.round(totalIn - ft*12);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["cm","ft-in"]).map(u=> (
          <Button key={u} variant={unit===u?"primary":"secondary"} onClick={()=>setUnit(u)}>{u}</Button>
        ))}
      </div>
      <div className="text-5xl font-bold">{unit==="cm"? Math.round(cm) : `${ft}′ ${inch}″`}</div>
      {unit==="cm" ? (
        <NumberStepper value={Math.round(cm)} setValue={setCm} step={1} min={100} max={230}/>
      ) : (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm text-gray-500">Feet</div>
            <NumberStepper value={ft} setValue={nv=> setCm(ftInToCm(nv, inch))} step={1} min={4} max={7}/>
          </div>
          <div>
            <div className="text-sm text-gray-500">Inches</div>
            <NumberStepper value={inch} setValue={nv=> setCm(ftInToCm(ft, nv))} step={1} min={0} max={11}/>
          </div>
        </div>
      )}
      <Button onClick={()=> onNext(cm)}>Next</Button>
    </div>
  );
}

function PlanConfiguration({ onComplete }){
  const [level, setLevel] = useState("Beginner");
  const [days, setDays] = useState(3);
  const [excludeLegs, setExcludeLegs] = useState(false);
  const plan = useMemo(()=> generateWorkoutPlan(level, days, excludeLegs), [level, days, excludeLegs]);
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["Beginner","Intermediate","Advanced"].map(l => (
          <Button key={l} variant={level===l?"primary":"secondary"} onClick={()=>setLevel(l)}>{l}</Button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Days / week</span>
        <NumberStepper value={days} setValue={setDays} min={3} max={7} step={1}/>
        <Button variant={excludeLegs?"danger":"secondary"} onClick={()=> setExcludeLegs(v=>!v)}>🦵 {excludeLegs?"Exclude Legs: ON":"Exclude Legs: OFF"}</Button>
      </div>
      <Card className="p-3">
        <div className="font-medium mb-2">Preview</div>
        <div className="grid gap-2">
          {plan.days.map((d,i)=> (
            <div key={d.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-gray-600">{d.exercises.join(" · ")}</div>
            </div>
          ))}
        </div>
      </Card>
      <Button onClick={()=> onComplete(plan)}>Proceed</Button>
    </div>
  );
}

function Onboarding({ onFinish }){
  const [profile, setProfile] = useState(defaultProfile);
  const [step, setStep] = useState(0);
  const steps = [
    { key: "profile", label: "Profile" },
    { key: "weight", label: "Weight" },
    { key: "height", label: "Height" },
    { key: "plan", label: "Plan" },
  ];
  function nextProfile(p){ setProfile(prev=> ({ ...prev, ...p })); setStep(1); }
  function nextWeight(kg){ setProfile(prev=> ({ ...prev, weightKg: kg })); setStep(2); }
  function nextHeight(cm){ setProfile(prev=> ({ ...prev, heightCm: cm })); setStep(3); }
  function complete(plan){
    // migrate histories
    const now = todayISO();
    const migrated = {
      ...profile,
      heightHistory: [{ date: now, cm: profile.heightCm }],
      weightHistory: [{ date: now, kg: profile.weightKg }],
    };
    saveToStorage(LS_KEYS.USER_PROFILE, migrated);
    saveToStorage(LS_KEYS.WORKOUT_PLAN, plan);
    const logs = buildInitialLogs(plan, todayISO());
    saveToStorage(LS_KEYS.LOGS, logs);
    saveToStorage(LS_KEYS.EXERCISE_PROGRESS, []);
    saveToStorage(LS_KEYS.EXERCISE_MEDIA, {});
    saveToStorage(LS_KEYS.CALORIE_LOGS, {});
    saveToStorage(LS_KEYS.CUSTOM_FOOD_LIST, []);
    onFinish();
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <Stepper current={step} steps={steps} />
      <div className="mt-4">
        {step===0 && <ProfileSetup initial={profile} onNext={nextProfile} />}
        {step===1 && <WeightSelector initialKg={profile.weightKg} onNext={nextWeight} />}
        {step===2 && <HeightSelector initialCm={profile.heightCm} onNext={nextHeight} />}
        {step===3 && <PlanConfiguration onComplete={complete} />}
      </div>
    </div>
  );
}

function Stepper({ current, steps }){
  const pct = Math.round(((current+1) / steps.length) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        {steps.map((s,i)=> (
          <div key={s.key} className={`flex-1 text-center ${i===current? "text-gray-900 font-medium" : ""}`}>{s.label}</div>
        ))}
      </div>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ----------------------------
// Schedule Creator (manual)
// ----------------------------
function ScheduleCreator({ onSaved }){
  const existingPlan = getFromStorage(LS_KEYS.WORKOUT_PLAN, null) || generateWorkoutPlan();
  const [plan, setPlan] = useState(existingPlan);
  const [search, setSearch] = useState("");
  const filtered = useMemo(()=> EXERCISE_LIST.filter(e => e.name.toLowerCase().includes(search.toLowerCase())), [search]);

  function addExercise(dayIdx, name){
    setPlan(p => {
      const cp = structuredClone(p);
      const day = cp.days[dayIdx];
      if (!day.exercises.includes(name)) day.exercises.push(name);
      return cp;
    });
  }
  function removeExercise(dayIdx, name){
    setPlan(p => {
      const cp = structuredClone(p);
      const day = cp.days[dayIdx];
      day.exercises = day.exercises.filter(n => n!==name);
      return cp;
    });
  }
  function save(){
    saveToStorage(LS_KEYS.WORKOUT_PLAN, plan);
    const logs = buildInitialLogs(plan, todayISO());
    saveToStorage(LS_KEYS.LOGS, logs);
    onSaved();
    alert("Plan saved & timeline rebuilt ✅");
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Schedule Creator</div>
        <Button onClick={save}>Save</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {plan.days.map((d, idx)=> (
          <Card key={d.id} className="p-3 space-y-2">
            <div className="font-medium">{d.name}</div>
            <div className="flex flex-wrap gap-2">
              {d.exercises.map(n => (
                <span key={n} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                  {n} <button className="ml-1 text-red-600" onClick={()=>removeExercise(idx,n)}>×</button>
                </span>
              ))}
            </div>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="Search to add exercise" value={search} onChange={e=>setSearch(e.target.value)} />
            <div className="max-h-28 overflow-auto border rounded-xl">
              {filtered.slice(0,20).map(e => (
                <button key={e.name} onClick={()=>addExercise(idx, e.name)} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                  {e.name} <span className="text-xs text-gray-500">({e.muscles.join(", ")})</span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ----------------------------
// Home Timeline
// ----------------------------
function HomeTimeline({ onOpenDay, onEditSchedule }){
  const logs = getFromStorage(LS_KEYS.LOGS, []);
  const today = todayISO();
  const currentIdx = logs.findIndex(l => l.date >= today && !l.completed);
  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Your Timeline</div>
        <Button variant="secondary" onClick={onEditSchedule}>Customize Plan</Button>
      </div>
      {logs.map((l)=> (
        <Card key={l.id} className={`p-3 ${l.completed? "opacity-60" : ""}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{l.title} • {l.date}</div>
              <div className="text-sm text-gray-600">{l.exercises.map(e=>e.name).slice(0,3).join(" · ")}{l.exercises.length>3?"…":""}</div>
            </div>
            {l.completed ? (
              <div className="text-green-600">✔</div>
            ) : l.date === today ? (
              <Button onClick={()=> onOpenDay(l.id)}>Start</Button>
            ) : l.date > today ? (
              <div className="text-gray-400">🔒</div>
            ) : (
              <Button variant="secondary" onClick={()=> onOpenDay(l.id)}>Log</Button>
            )}
          </div>
        </Card>
      ))}
      {currentIdx === -1 && (
        <Card className="p-4 text-center">
          <div className="font-medium">All set! No pending workouts.</div>
        </Card>
      )}
    </div>
  );
}

// ----------------------------
// Day Detail (logging)
// ----------------------------
function DayDetail({ logId, onBack }){
  const [logs, setLogs] = useState(getFromStorage(LS_KEYS.LOGS, []));
  const [progress, setProgress] = useState(getFromStorage(LS_KEYS.EXERCISE_PROGRESS, []));
  const idx = logs.findIndex(l => l.id === logId);
  const log = logs[idx];

  function updateExercise(i, updater){
    setLogs(prev => {
      const cp = structuredClone(prev);
      cp[idx].exercises[i] = updater(cp[idx].exercises[i]);
      saveToStorage(LS_KEYS.LOGS, cp);
      return cp;
    });
  }

  function markComplete(){
    const now = todayISO();
    // record heaviest set per exercise
    const entries = log.exercises.map(ex => {
      const hs = ex.sets.reduce((acc, s) => s.weight>acc.weight? s : acc, { weight: 0, reps: 0 });
      return { id: generateId("prog"), date: now, exercise: ex.name, weight: hs.weight, reps: hs.reps };
    });
    const newProgress = [...progress, ...entries];
    setProgress(newProgress);
    saveToStorage(LS_KEYS.EXERCISE_PROGRESS, newProgress);

    // mark done
    const updated = structuredClone(logs);
    updated[idx].completed = true;
    saveToStorage(LS_KEYS.LOGS, updated);
    setLogs(updated);

    // auto-extend if ≤1 future
    const future = updated.filter(l => !l.completed && l.date >= now);
    if (future.length <= 1) {
      const plan = getFromStorage(LS_KEYS.WORKOUT_PLAN, generateWorkoutPlan());
      const lastDate = new Date(updated[updated.length-1].date);
      const next = buildInitialLogs(plan, new Date(lastDate.setDate(lastDate.getDate()+1)).toISOString().slice(0,10));
      const merged = [...updated, ...next];
      saveToStorage(LS_KEYS.LOGS, merged);
      setLogs(merged);
    }
    alert("Great job! Day marked complete ✅");
    onBack();
  }

  const allCovered = log.exercises.every(ex => ex.skipped || ex.sets.length>0);

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <div className="text-lg font-semibold">{log.title} • {log.date}</div>
      </div>
      {log.exercises.map((ex, i)=> (
        <Card key={ex.name} className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{ex.name}</div>
            <button className={`text-sm ${ex.skipped? "text-orange-600" : "text-gray-600"}`} onClick={()=> updateExercise(i, e=> ({...e, skipped: !e.skipped}))}>
              {ex.skipped? "Undo Skip" : "Skip"}
            </button>
          </div>
          {!ex.skipped && (
            <div className="grid grid-cols-2 gap-2">
              {ex.sets.map((s, si)=> (
                <Card key={si} className="p-2">
                  <div className="text-xs text-gray-500">Set {si+1}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Weight (kg)</div>
                      <NumberStepper value={s.weight} setValue={(nv)=> updateExercise(i, e=> { const cp=structuredClone(e); cp.sets[si].weight = nv; return cp; })} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Reps</div>
                      <NumberStepper value={s.reps} setValue={(nv)=> updateExercise(i, e=> { const cp=structuredClone(e); cp.sets[si].reps = nv; return cp; })} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {!ex.skipped && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={()=> updateExercise(i, e=> ({...e, sets: [...e.sets, { reps: 10, weight: 10 }]}))}>Add Set</Button>
              <Button variant="lightDanger" onClick={()=> updateExercise(i, e=> ({...e, sets: e.sets.slice(0, -1)}))} disabled={ex.sets.length===0}>Delete Set</Button>
            </div>
          )}
          <textarea className="w-full border rounded-xl px-3 py-2" placeholder="Notes" value={ex.notes} onChange={e=> updateExercise(i, exx=> ({...exx, notes: e.target.value}))} />
        </Card>
      ))}
      <Button onClick={markComplete} disabled={!allCovered}>
        Mark Day as Complete
      </Button>
    </div>
  );
}

// ----------------------------
// Workout Analytics
// ----------------------------
function CalendarHeat({ logs }){
  // Simple month grid: mark days that have a workout (green if completed, gray if not)
  const byDate = new Map(logs.map(l => [l.date, l.completed]));
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0);
  const days = last.getDate();
  const blanks = first.getDay();
  const cells = Array.from({ length: blanks }).map((_,i)=> <div key={`b${i}`} />);
  for (let d=1; d<=days; d++){
    const date = new Date(year, month, d).toISOString().slice(0,10);
    const completed = byDate.get(date);
    cells.push(
      <div key={date} className={`w-6 h-6 rounded ${completed===true? "bg-green-500" : byDate.has(date)? "bg-gray-300" : "bg-gray-100"}`} title={`${date} ${completed?"✓":""}`}></div>
    );
  }
  return (
    <div>
      <div className="text-sm text-gray-500 mb-2">This Month</div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
}

function WorkoutAnalytics(){
  const logs = getFromStorage(LS_KEYS.LOGS, []);
  const progress = getFromStorage(LS_KEYS.EXERCISE_PROGRESS, []);
  const exercises = Array.from(new Set(progress.map(p => p.exercise))).sort();
  const [pick, setPick] = useState(exercises[0] || "");
  const series = progress.filter(p => p.exercise===pick).sort((a,b)=> a.date.localeCompare(b.date));
  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4">
      <div className="text-xl font-semibold">Analytics</div>
      <Card className="p-3">
        <CalendarHeat logs={logs} />
      </Card>
      <Card className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">Exercise Progress</div>
          <select className="border rounded-xl px-3 py-2" value={pick} onChange={e=>setPick(e.target.value)}>
            <option value="">Select exercise</option>
            {exercises.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        {series.length===0 ? (
          <div className="text-sm text-gray-500">No data yet.</div>
        ) : (
          <SimpleLineChart data={series} accessor={d=> d.weight} />
        )}
      </Card>
    </div>
  );
}

// ----------------------------
// Calorie Tracker (with barcode stub)
// ----------------------------
function CalorieTracker(){
  const profile = getFromStorage(LS_KEYS.USER_PROFILE, defaultProfile);
  const [goal, setGoal] = useState(profile.goalDailyCalories || 2000);
  const [date, setDate] = useState(todayISO());
  const [query, setQuery] = useState("");
  const customList = getFromStorage(LS_KEYS.CUSTOM_FOOD_LIST, []);
  const calories = getFromStorage(LS_KEYS.CALORIE_LOGS, {});
  const dayItems = calories[date] || [];
  const suggestions = useMemo(()=> {
    const pool = [...FOOD_LIST, ...customList];
    return pool.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0,12);
  }, [query, customList]);

  const consumed = dayItems.reduce((a,b)=> a+b.kcal, 0);
  const remaining = Math.max(0, goal - consumed);

  function addFood(name, kcal){
    const entry = { id: generateId("food"), name, kcal };
    const next = { ...calories, [date]: [...dayItems, entry] };
    saveToStorage(LS_KEYS.CALORIE_LOGS, next);
  }
  function removeFood(id){
    const next = { ...calories, [date]: dayItems.filter(f => f.id !== id) };
    saveToStorage(LS_KEYS.CALORIE_LOGS, next);
  }

  function addCustom(){
    const name = query.trim();
    if (!name) return;
    const kcal = Number(prompt("Calories?", "100")) || 0;
    const newCustom = { name, kcal };
    const nextList = [newCustom, ...customList].slice(0, 100);
    saveToStorage(LS_KEYS.CUSTOM_FOOD_LIST, nextList);
    addFood(name, kcal);
    setQuery("");
  }

  useEffect(()=>{
    const p = { ...profile, goalDailyCalories: goal };
    saveToStorage(LS_KEYS.USER_PROFILE, p);
  }, [goal]);

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4">
      <div className="text-xl font-semibold">Calorie Tracker</div>
      <Card className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Daily Goal (kcal)</div>
          <NumberStepper value={goal} setValue={setGoal} step={50} min={800} max={5000} />
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black" style={{ width: `${Math.min(100, (consumed/Math.max(goal,1))*100)}%` }} />
        </div>
        <div className="text-sm text-gray-600">Consumed: <span className="font-medium">{consumed}</span> • Remaining: <span className="font-medium">{remaining}</span></div>
      </Card>

      <Card className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <input type="date" className="border rounded-xl px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} />
          <Button variant="secondary" onClick={()=> alert("Barcode scanner stub — integrate html5-qrcode & OpenFoodFacts fetch here.")}>Scan Barcode</Button>
        </div>
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Search food or type custom…" value={query} onChange={e=>setQuery(e.target.value)} />
        <div className="grid gap-2">
          {suggestions.map(s => (
            <button key={s.name} className="w-full text-left px-3 py-2 rounded-xl border hover:bg-gray-50" onClick={()=> addFood(s.name, s.kcal)}>
              {s.name} <span className="text-xs text-gray-500">• {s.kcal} kcal</span>
            </button>
          ))}
          {query && (
            <Button variant="secondary" onClick={addCustom}>Add Custom “{query}”</Button>
          )}
        </div>
      </Card>

      <Card className="p-3">
        <div className="font-medium mb-2">Today’s Items</div>
        <div className="divide-y">
          {dayItems.map(item => (
            <div key={item.id} className="py-2 flex items-center justify-between">
              <div>{item.name}</div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{item.kcal} kcal</div>
                <button className="text-red-600" onClick={()=>removeFood(item.id)}>Delete</button>
              </div>
            </div>
          ))}
          {dayItems.length===0 && <div className="text-sm text-gray-500">No items yet.</div>}
        </div>
      </Card>
    </div>
  );
}

// ----------------------------
// Profile & Data Management
// ----------------------------
function Profile(){
  const [profile, setProfile] = useState(getFromStorage(LS_KEYS.USER_PROFILE, defaultProfile));
  const version = getFromStorage(LS_KEYS.APP_VERSION, null);
  const bmi = useMemo(()=> {
    const hM = profile.heightCm/100;
    const b = profile.weightKg / (hM*hM);
    return Math.round(b * 10)/10;
  }, [profile.heightCm, profile.weightKg]);
  const bmiCat = bmi<18.5? "Underweight" : bmi<25? "Healthy" : bmi<30? "Overweight" : "Obese";

  function update(field, value){
    const next = { ...profile, [field]: value };
    setProfile(next);
    saveToStorage(LS_KEYS.USER_PROFILE, next);
  }
  function pushWeight(delta){
    const kg = clamp(profile.weightKg + delta, 20, 400);
    const hist = [...(profile.weightHistory||[]), { date: todayISO(), kg }];
    update("weightKg", kg);
    update("weightHistory", hist);
  }
  function pushHeight(delta){
    const cm = clamp(profile.heightCm + delta, 100, 230);
    const hist = [...(profile.heightHistory||[]), { date: todayISO(), cm }];
    update("heightCm", cm);
    update("heightHistory", hist);
  }

  function exportData(){
    const payload = {};
    Object.values(LS_KEYS).forEach(k => payload[k] = getFromStorage(k, null));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fitness_data_${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function importData(ev){
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const j = JSON.parse(reader.result);
        const required = Object.values(LS_KEYS);
        const all = required.every(k => k in j);
        if (!all) throw new Error("Missing keys");
        required.forEach(k => saveToStorage(k, j[k]));
        alert("Import successful. Reloading…");
        window.location.reload();
      } catch(err){
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  function resetTimeline(){
    if (prompt("Type RESET to confirm timeline reset")!=="RESET") return;
    const logs = getFromStorage(LS_KEYS.LOGS, []);
    logs.forEach(l => l.completed = false);
    saveToStorage(LS_KEYS.LOGS, logs);
    alert("Timeline reset. You’re back to Day 1.");
  }
  function resetCalories(){
    if (prompt("Type RESET to clear calorie data")!=="RESET") return;
    saveToStorage(LS_KEYS.CALORIE_LOGS, {});
    saveToStorage(LS_KEYS.CUSTOM_FOOD_LIST, []);
    alert("Calorie data cleared.");
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Profile</div>
        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 border">v{LATEST_APP_VERSION}</div>
      </div>

      <Card className="p-3 flex items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border">
          {profile.photo? <img src={profile.photo} alt="avatar" className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center text-gray-400">👤</div>}
        </div>
        <div className="flex-1">
          <input className="w-full border rounded-xl px-3 py-2" value={profile.name} onChange={e=>update("name", e.target.value)} />
          <div className="text-sm text-gray-500">Version stored: {version || "—"}</div>
        </div>
      </Card>

      <Card className="p-3 grid grid-cols-2 gap-3 items-center">
        <div>
          <div className="text-sm text-gray-500">Weight (kg)</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={()=>pushWeight(-1)}>−</Button>
            <div className="text-lg font-semibold">{profile.weightKg}</div>
            <Button variant="secondary" onClick={()=>pushWeight(1)}>+</Button>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Height (cm)</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={()=>pushHeight(-1)}>−</Button>
            <div className="text-lg font-semibold">{profile.heightCm}</div>
            <Button variant="secondary" onClick={()=>pushHeight(1)}>+</Button>
          </div>
        </div>
        <div className="col-span-2">
          <Card className="p-3">
            <div className="text-sm text-gray-500">BMI</div>
            <div className="text-2xl font-bold">{bmi} <span className="text-base font-normal text-gray-500">{bmiCat}</span></div>
          </Card>
        </div>
      </Card>

      <Card className="p-3 space-y-2">
        <div className="font-medium">Data Management</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>Export My Data</Button>
          <label className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer">Import Data
            <input type="file" accept="application/json" className="hidden" onChange={importData} />
          </label>
        </div>
      </Card>

      <Card className="p-3 space-y-2">
        <div className="font-medium">Reset</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="lightDanger" onClick={resetTimeline}>Reset Timeline</Button>
          <Button variant="lightDanger" onClick={resetCalories}>Reset Calorie Data</Button>
        </div>
      </Card>
    </div>
  );
}

// ----------------------------
// Root App
// ----------------------------
export default function App(){
  // mount/load
  const [boot, setBoot] = useState({ ready: false, hasProfile: false, hasPlan: false });
  const [route, setRoute] = useState("home"); // onboarding | schedule | home | day | analytics | calories | profile
  const [dayLogId, setDayLogId] = useState(null);
  const [showVersionCard, setShowVersionCard] = useState(false);

  useEffect(()=>{
    const storedV = getFromStorage(LS_KEYS.APP_VERSION, null);
    if (storedV !== LATEST_APP_VERSION) setShowVersionCard(true);

    const profile = getFromStorage(LS_KEYS.USER_PROFILE, null);
    const plan = getFromStorage(LS_KEYS.WORKOUT_PLAN, null);

    const hasProfile = !!(profile && profile.name && profile.age && profile.gender);
    const hasPlan = !!(plan && plan.days && plan.days.length>0);

    setBoot({ ready: true, hasProfile, hasPlan });

    // migrate single values to histories if needed
    if (profile) {
      let migrated = false;
      const now = todayISO();
      if (!Array.isArray(profile.heightHistory) || profile.heightHistory.length===0) {
        profile.heightHistory = [{ date: now, cm: profile.heightCm }];
        migrated = true;
      }
      if (!Array.isArray(profile.weightHistory) || profile.weightHistory.length===0) {
        profile.weightHistory = [{ date: now, kg: profile.weightKg }];
        migrated = true;
      }
      if (migrated) saveToStorage(LS_KEYS.USER_PROFILE, profile);
    }

    // initial routing
    if (!hasProfile) setRoute("onboarding");
    else if (!hasPlan) setRoute("schedule");
    else setRoute("home");
  }, []);

function handleUpdateNow(){
  saveToStorage(LS_KEYS.APP_VERSION, LATEST_APP_VERSION);
  setShowVersionCard(false);
  window.location.reload();
}
function handleLater(){
  saveToStorage(LS_KEYS.APP_VERSION, LATEST_APP_VERSION);
  setShowVersionCard(false);
}

function openDay(id){ setDayLogId(id); setRoute("day"); }

if (!boot.ready) return <div className="p-6">Loading…</div>;

return (
  <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 font-[Poppins,sans-serif] pb-24">
    <header className="max-w-xl mx-auto px-4 pt-4">
      <div className="text-2xl font-bold">GTracker</div>
      <div className="text-xs text-gray-500">Single-file React Fitness App</div>
    </header>

    <main>
      {route==="onboarding" && <Onboarding onFinish={()=> setRoute("home")} />}
      {route==="schedule" && <ScheduleCreator onSaved={()=> setRoute("home")} />}
      {route==="home" && <HomeTimeline onOpenDay={openDay} onEditSchedule={()=> setRoute("schedule")} />}
      {route==="day" && dayLogId && <DayDetail logId={dayLogId} onBack={()=> setRoute("home")} />}
      {route==="analytics" && <WorkoutAnalytics />}
      {route==="calories" && <CalorieTracker />}
      {route==="profile" && <Profile />}
    </main>

    {route!=="onboarding" && (
      <TabBar active={route==="home"?"home": route} onChange={(k)=> setRoute(k)} />
    )}

    {showVersionCard && (
      <VersionBanner
        currentVersion={getFromStorage(LS_KEYS.APP_VERSION, null)}
        onUpdateNow={handleUpdateNow}
        onLater={handleLater}
      />
    )}

    <style>{`
      @keyframes bounce-in { 0% { transform: scale(0.8); opacity: 0.6; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      .animate-\\[bounce-in_300ms_ease] { animation: bounce-in 300ms ease; }
    `}</style>
  </div>
);
}

