import Link from "next/link";
import { Cpu, Github, Twitter, Heart } from "lucide-react";

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t mt-20" style={{ borderColor: "var(--border-glass)", background: "var(--bg-secondary)" }}>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-accent)" }}>
                                <Cpu size={16} color="white" />
                            </div>
                            <span className="text-xl font-bold gradient-text font-outfit">LaptopMind</span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            AI-powered laptop recommendations and price comparison across top Indian e-commerce stores.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Quick Links</h3>
                        <ul className="space-y-2">
                            {[["Browse Laptops", "/laptops"], ["Laptop Finder", "/finder"], ["Compare", "/compare"]].map(([label, href]) => (
                                <li key={href}>
                                    <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Categories</h3>
                        <ul className="space-y-2">
                            {["Gaming Laptops", "AI/ML Laptops", "Student Laptops", "Creator Laptops"].map((cat) => (
                                <li key={cat}>
                                    <Link href={`/laptops?usage=${cat.split(" ")[0]}`} className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>{cat}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Legal</h3>
                        <ul className="space-y-2">
                            {["Privacy Policy", "Terms of Use", "Affiliate Disclosure"].map((item) => (
                                <li key={item}>
                                    <span className="text-sm cursor-pointer transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--border-glass)" }}>
                    <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        © {year} LaptopMind · Made with <Heart size={12} className="text-red-500" fill="currentColor" /> · Affiliate links may earn commission
                    </p>
                    <div className="flex items-center gap-3">
                        <a href="#" className="p-2 glass rounded-lg transition-all hover:scale-110" style={{ color: "var(--text-muted)" }} aria-label="GitHub"><Github size={16} /></a>
                        <a href="#" className="p-2 glass rounded-lg transition-all hover:scale-110" style={{ color: "var(--text-muted)" }} aria-label="Twitter"><Twitter size={16} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
