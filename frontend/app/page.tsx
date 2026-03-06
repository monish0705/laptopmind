"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Search, TrendingDown, BarChart3, ArrowRight, Star, Shield, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import LaptopCard from "@/components/LaptopCard";
import { api, Laptop } from "@/lib/api";

const features = [
  {
    icon: <Zap size={24} />,
    title: "AI Recommendations",
    desc: "Answer 8 questions and get your perfect laptop match in seconds.",
    color: "#8b5cf6",
  },
  {
    icon: <TrendingDown size={24} />,
    title: "Price History Charts",
    desc: "Track price movements over 90 days like a stock market chart.",
    color: "#4f8cff",
  },
  {
    icon: <Search size={24} />,
    title: "5-Store Comparison",
    desc: "Compare prices from Amazon, Flipkart, Croma, and more.",
    color: "#22d3ee",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Performance Ratings",
    desc: "Star-based ratings for Gaming, AI/ML, Video Editing & Battery.",
    color: "#22c55e",
  },
];

const stats = [
  { label: "Laptops Tracked", value: "16+" },
  { label: "Stores Compared", value: "5" },
  { label: "Price Alerts", value: "Real-Time" },
  { label: "Usage Profiles", value: "5" },
];

export default function HomePage() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLaptops().then((data) => {
      setLaptops(data.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "rgba(79,140,255,0.15)" }}
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "rgba(139,92,246,0.15)" }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ color: "var(--accent-blue)", border: "1px solid rgba(79,140,255,0.3)" }}
          >
            <Cpu size={14} />
            AI-Powered Laptop Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6 font-outfit"
            style={{ color: "var(--text-primary)" }}
          >
            Find Your Perfect
            <br />
            <span className="gradient-text">Laptop in 30 Seconds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            AI-powered recommendations + real-time price comparison across Amazon, Flipkart, Croma and more — all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/finder">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(79,140,255,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold text-white animate-pulse-glow"
                style={{ background: "var(--gradient-accent)" }}
                id="hero-cta-btn"
              >
                <Zap size={20} />
                Start Laptop Finder
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link href="/laptops">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold glass"
                style={{ color: "var(--text-primary)", border: "1px solid var(--border-glass)" }}
                id="browse-all-btn"
              >
                Browse All Laptops
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4">
                <div className="text-3xl font-black gradient-text font-outfit">{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black font-outfit mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Everything You Need to
            <span className="gradient-text"> Buy Smart</span>
          </motion.h2>
          <p style={{ color: "var(--text-secondary)" }}>Stop guessing. Start knowing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl p-6 card-hover"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}20`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Laptops */}
      <section className="py-24 px-4" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black font-outfit" style={{ color: "var(--text-primary)" }}>
                Featured Laptops
              </h2>
              <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Hand-picked for every budget and use case</p>
            </div>
            <Link href="/laptops">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold glass"
                style={{ color: "var(--text-primary)", border: "1px solid var(--border-glass)" }}
                id="view-all-laptops-btn"
              >
                View All <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl h-80 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {laptops.map((laptop, i) => (
                <LaptopCard key={laptop.id} laptop={laptop} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-16 relative overflow-hidden"
            style={{ background: "var(--gradient-card)", border: "1px solid var(--border-glass)" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(79,140,255,0.1)" }} />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.1)" }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black font-outfit mb-4" style={{ color: "var(--text-primary)" }}>
                Ready to Find Your
                <br /><span className="gradient-text">Dream Laptop?</span>
              </h2>
              <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
                Answer 8 simple questions. Get your perfect match in seconds.
              </p>
              <Link href="/finder">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-2xl text-lg font-bold text-white"
                  style={{ background: "var(--gradient-accent)" }}
                  id="bottom-cta-btn"
                >
                  Start Laptop Finder →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
