"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { api, RecommendationRequest } from "@/lib/api";

const STEPS = [
    {
        id: "budget",
        question: "What's your budget?",
        subtitle: "We'll find the best value within your range",
        type: "budget",
        options: [
            { label: "Under ₹60,000", value: 60000 },
            { label: "₹60k – ₹1 Lakh", value: 100000 },
            { label: "₹1 Lakh – ₹1.5 Lakh", value: 150000 },
            { label: "₹1.5 Lakh – ₹2 Lakh", value: 200000 },
            { label: "₹2 Lakh – ₹3 Lakh", value: 300000 },
            { label: "₹3 Lakh+", value: 500000 },
        ],
    },
    {
        id: "usage",
        question: "What will you primarily use it for?",
        subtitle: "This shapes the entire recommendation",
        type: "single",
        options: [
            { label: "🎮 Gaming", value: "Gaming" },
            { label: "🤖 AI / Machine Learning", value: "AI/ML" },
            { label: "🎬 Video Editing", value: "Video Editing" },
            { label: "💻 Programming", value: "Programming" },
            { label: "🎓 Student / General Use", value: "Student" },
        ],
    },
    {
        id: "cpu_pref",
        question: "CPU preference?",
        subtitle: "Both are great — pick if you have a preference",
        type: "single",
        options: [
            { label: "⚡ Intel Core", value: "Intel" },
            { label: "🔴 AMD Ryzen", value: "Ryzen" },
            { label: "🍎 Apple Silicon (M-series)", value: "Apple" },
            { label: "🤷 No Preference", value: "No preference" },
        ],
    },
    {
        id: "gpu_pref",
        question: "GPU requirement?",
        subtitle: "Affects performance for gaming and creative work",
        type: "single",
        options: [
            { label: "🟤 RTX 3050 / 3060 (30-series, Budget)", value: "RTX 30" },
            { label: "🟢 RTX 4050 (40-series, Entry Gaming)", value: "RTX 4050" },
            { label: "🔵 RTX 4060 (40-series, Mid-Range)", value: "RTX 4060" },
            { label: "🔴 RTX 4070 / 4080 / 4090 (40-series, High-End)", value: "RTX 4070" },
            { label: "⚡ RTX 5060 / 5070 (50-series, Next-Gen Mid)", value: "RTX 5060" },
            { label: "🚀 RTX 5080 / 5090 (50-series, Next-Gen Flagship)", value: "RTX 5080" },
            { label: "💡 Integrated GPU is fine", value: "No preference" },
        ],
    },
    {
        id: "gpu_mode",
        question: "GPU matching mode?",
        subtitle: "How strictly should we match your GPU selection?",
        type: "single",
        options: [
            { label: "📈 Minimum — show laptops at or above my selected GPU tier (recommended)", value: "minimum" },
            { label: "🎯 Exact — show only laptops from that GPU generation family", value: "exact" },
        ],
    },
    {
        id: "ram",
        question: "How much RAM do you need?",
        subtitle: "More RAM = better multitasking",
        type: "single",
        options: [
            { label: "8 GB", value: 8 },
            { label: "16 GB (Recommended)", value: 16 },
            { label: "32 GB", value: 32 },
            { label: "64 GB (Power Users)", value: 64 },
        ],
    },
    {
        id: "storage",
        question: "Storage requirement?",
        subtitle: "SSDs are much faster than HDDs",
        type: "single",
        options: [
            { label: "256 GB SSD", value: 256 },
            { label: "512 GB SSD", value: 512 },
            { label: "1 TB SSD", value: 1024 },
            { label: "2 TB SSD", value: 2048 },
        ],
    },
    {
        id: "battery_priority",
        question: "How important is battery life?",
        subtitle: "Laptops with great battery often sacrifice some performance",
        type: "single",
        options: [
            { label: "🔋 Very important — work on the go", value: true },
            { label: "⚡ Not critical — always near a charger", value: false },
        ],
    },
    {
        id: "lightweight",
        question: "Do you need a lightweight laptop?",
        subtitle: "Under 1.8kg for portability",
        type: "single",
        options: [
            { label: "🧳 Yes — I travel a lot", value: true },
            { label: "🏠 No — mainly desk use", value: false },
        ],
    },
];

export default function FinderPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(1);

    const current = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    function handleSelect(value: any) {
        const newAnswers = { ...answers, [current.id]: value };
        setAnswers(newAnswers);

        if (step < STEPS.length - 1) {
            setDirection(1);
            setTimeout(() => setStep((s) => s + 1), 150);
        } else {
            submitRecommendation(newAnswers);
        }
    }

    async function submitRecommendation(ans: Record<string, any>) {
        setLoading(true);
        const req: RecommendationRequest = {
            budget: ans.budget ?? 150000,
            usage: ans.usage ?? "Student",
            cpu_pref: ans.cpu_pref ?? "No preference",
            gpu_pref: ans.gpu_pref ?? "No preference",
            gpu_mode: ans.gpu_mode ?? "minimum",
            ram: ans.ram ?? 16,
            storage: ans.storage ?? 512,
            battery_priority: ans.battery_priority ?? false,
            lightweight: ans.lightweight ?? false,
        };

        try {
            const results = await api.recommend(req);
            localStorage.setItem("recommendation_results", JSON.stringify(results));
            localStorage.setItem("recommendation_req", JSON.stringify(req));
            router.push("/finder/results");
        } catch (e) {
            alert("Recommendation failed. Is the backend running?");
            setLoading(false);
        }
    }

    function goBack() {
        if (step > 0) {
            setDirection(-1);
            setStep((s) => s - 1);
        }
    }

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                            Question {step + 1} of {STEPS.length}
                        </span>
                        <span className="text-sm font-medium gradient-text">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full rounded-full"
                            style={{ background: "var(--gradient-accent)" }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="rounded-3xl p-8"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}
                    >
                        <h2 className="text-2xl md:text-3xl font-black font-outfit mb-2" style={{ color: "var(--text-primary)" }}>
                            {current.question}
                        </h2>
                        <p className="mb-8" style={{ color: "var(--text-muted)" }}>{current.subtitle}</p>

                        <div className="space-y-3">
                            {current.options.map((opt) => (
                                <motion.button
                                    key={String(opt.value)}
                                    onClick={() => handleSelect(opt.value)}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full text-left p-4 rounded-2xl font-medium flex items-center justify-between transition-all"
                                    style={{
                                        background: answers[current.id] === opt.value ? "rgba(79,140,255,0.15)" : "var(--bg-secondary)",
                                        border: `1px solid ${answers[current.id] === opt.value ? "var(--accent-blue)" : "var(--border-glass)"}`,
                                        color: "var(--text-primary)",
                                    }}
                                    id={`option-${String(opt.value).replace(/[^a-zA-Z0-9]/g, "-")}`}
                                >
                                    <span>{opt.label}</span>
                                    <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={goBack}
                        disabled={step === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium glass disabled:opacity-30"
                        style={{ color: "var(--text-secondary)" }}
                        id="finder-back-btn"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>Click an option to advance</span>
                </div>

                {/* Loading */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                        style={{ background: "rgba(10,10,15,0.9)" }}
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4"
                                style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }}
                            />
                            <p className="text-lg font-bold gradient-text">Finding your perfect laptops...</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
