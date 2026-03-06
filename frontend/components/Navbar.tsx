"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Moon, Cpu, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/laptops", label: "Browse" },
    { href: "/finder", label: "Finder" },
    { href: "/compare", label: "Compare" },
];

export default function Navbar() {
    const { theme, toggle } = useTheme();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 glass border-b"
            style={{ borderColor: "var(--border-glass)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--gradient-accent)" }}
                    >
                        <Cpu size={16} color="white" />
                    </motion.div>
                    <span className="text-xl font-bold gradient-text font-outfit">
                        LaptopMind
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? "text-white"
                                    : "hover:text-white"
                                }`}
                            style={{
                                color: pathname === link.href ? "var(--accent-blue)" : "var(--text-secondary)",
                                background: pathname === link.href ? "rgba(79,140,255,0.1)" : "transparent",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={toggle}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg glass transition-all duration-200"
                        style={{ color: "var(--text-secondary)" }}
                        aria-label="Toggle theme"
                        id="theme-toggle-btn"
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </motion.button>

                    <Link href="/finder">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style={{ background: "var(--gradient-accent)" }}
                            id="nav-cta-btn"
                        >
                            Start Finder
                        </motion.button>
                    </Link>

                    {/* Mobile menu */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg glass"
                        style={{ color: "var(--text-secondary)" }}
                        id="mobile-menu-btn"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden px-4 pb-4 glass border-t"
                    style={{ borderColor: "var(--border-glass)" }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="block py-3 text-sm font-medium"
                            style={{ color: pathname === link.href ? "var(--accent-blue)" : "var(--text-secondary)" }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/finder" onClick={() => setMenuOpen(false)}>
                        <button className="mt-2 w-full py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--gradient-accent)" }}>
                            Start Laptop Finder
                        </button>
                    </Link>
                </motion.div>
            )}
        </motion.nav>
    );
}
