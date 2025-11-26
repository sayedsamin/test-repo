"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden text-foreground">
      
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Primary gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950" />
        
        {/* Animated orbs for depth */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-[100px] animate-pulse" />
        <div className="absolute top-[20%] right-[-15%] w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/15 to-transparent blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-72 h-72 rounded-full bg-gradient-to-br from-blue-400/10 to-transparent blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
      </div>

      {/* Glossy Border Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16 md:px-8 md:py-24">
        
        {/* Top Section: Brand */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-cyan-200">
                SkillShare
              </span>
            </div>

            <p className="text-slate-300 max-w-sm leading-relaxed font-light">
              Connect with skilled professionals and share your expertise with
              others in your community. We build bridges between talent and opportunity.
            </p>

            <div className="flex gap-3 pt-2">
              {[
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                { icon: Github, href: "https://github.com", label: "GitHub" },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-primary/50 hover:to-blue-500/50 transition-all duration-300 ease-out border border-white/20 hover:border-white/40 backdrop-blur-sm"
                >
                  <social.icon className="h-5 w-5 text-white/80 group-hover:text-white transition-all group-hover:scale-110" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-7 flex items-center justify-end">
            <div className="text-slate-400 text-sm italic font-light">
              Building connections, one skill at a time.
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent mb-12" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {["Browse Skills", "Categories", "How It Works", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-slate-400 hover:text-white transition-colors group"
                  >
                    <span className="relative">
                      {item}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-primary to-blue-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {["About Us", "Careers", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-slate-400 hover:text-white transition-colors group"
                  >
                    <span className="relative">
                      {item}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              {["Community", "Help Center", "Partners", "Status"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-slate-400 hover:text-white transition-colors group"
                  >
                    <span className="relative">
                      {item}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-slate-400 hover:text-white transition-colors group"
                  >
                    <span className="relative">
                      {item}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © {new Date().getFullYear()} SkillShare. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-slate-300">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
