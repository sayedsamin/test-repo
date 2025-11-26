"use client";

import Link from "next/link";
import { Menu, User, LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { SignupModal } from "./signup-modal";
import { LoginModal } from "./login-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignupClick = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleLoginClick = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950" />
          <div className="absolute top-[-30%] left-[-15%] w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/15 to-transparent blur-[80px] animate-pulse" />
          <div
            className="absolute top-[-20%] right-[-10%] w-56 h-56 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent blur-[70px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent z-10" />

        <div className="relative z-10 container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-lg shadow-blue-500/50">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-cyan-200">
              SkillShare
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
               className="group relative text-slate-200 transition-colors">

                <span className="relative">
                  Home
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                </span>
              </Button>
            </Link>

            <Link href="/learn">
              <Button
                variant="ghost"
                className="group relative text-slate-200 transition-colors"
                >

                
                <span className="relative">
                  Learn a Skill
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                </span>
              </Button>
            </Link>

            <Link href="/tutors">
              <Button
                variant="ghost"
                className="group relative text-slate-200 transition-colors"
              >
                <span className="relative">
                  Find a Tutor
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                </span>
              </Button>
            </Link>

            <Link href="/reviews">
              <Button
                variant="ghost"
                className="group relative text-slate-200 transition-colors"
              >
                <span className="relative">
                  Ratings & Reviews
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                </span>
              </Button>
            </Link>

            <Link href="/latest">
              <Button
                variant="ghost"
                className="group relative text-slate-200 transition-colors"
              >
                <span className="relative">
                  Latest
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                </span>
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {!mounted || isLoading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="group relative text-slate-200 transition-colors"
                    >
                      <span className="relative">
                        Dashboard
                        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 group relative text-slate-200 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span className="relative">
                          {user?.email || "Account"}
                          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoginClick}
                    className="h-9 inline-flex items-center justify-center rounded-md px-3 text-sm font-medium text-slate-200 transition-colors group relative"
                  >
                    <span className="relative">
                      Sign In
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Button>

                  <button
                    onClick={handleSignupClick}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 to-cyan-300 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-300/40 transition-all hover:shadow-lg hover:shadow-blue-300/70 hover:scale-105"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-800/50"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden relative z-20">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950" />
            <nav className="relative container px-4 py-4 space-y-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                >
                  Home
                </Button>
              </Link>
              
              <Link href="/learn" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                >
                  Learn a Skill
                </Button>
              </Link>

              <Link href="/tutors" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                >
                  Find a Tutor
                </Button>
              </Link>

              <Link href="/reviews" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                >
                  Ratings & Reviews
                </Button>
              </Link>

              <Link href="/latest" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                >
                  Latest
                </Button>
              </Link>

              <div className="pt-4 border-t border-slate-700/50 space-y-2">
                {!mounted || isLoading ? (
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                ) : isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-slate-800/50"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-200 hover:bg-slate-800/50"
                      onClick={() => {
                        handleLoginClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    
                    <button
                      onClick={() => {
                        handleSignupClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 to-cyan-300 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-300/40"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={handleSignupClick}
      />
    </>
  );
}
