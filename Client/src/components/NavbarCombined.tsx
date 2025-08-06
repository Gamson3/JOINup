"use client";

import Link from "next/link";
import { Globe, Calendar, Plus, Search, Filter } from "lucide-react";
import { Button } from "./ui/button";

const NavbarCombined = () => {
  return (
    <nav className="absolute top-0 left-0 w-full backdrop-blur-md bg-gradient-to-b from-[#050204]/80 to-[#242838]/20 border-b border-white/10 z-50">

      {/* Top Section - Original Navbar */}
      <div className="flex justify-between items-center px-8 py-4 text-white">
        {/* Logo */}
        <div className="text-2xl text-white font-bold tracking-wide" style={{ fontFamily: "var(--font-sans)" }}>
          JOINup
        </div>

        {/* Center Text (Hidden on small screens) */}
        <p className="hidden md:block text-white text-sm">
          End-to-end tools to simplify your conference management process.
        </p>

        {/* Auth Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" className="border-white text-gray-900 hover:bg-white hover:text-black cursor-pointer">
            Sign In
          </Button>
          <Button className="bg-[#6A011D] text-white hover:bg-[#550117] cursor-pointer">
            Sign Up
          </Button>
        </div>
      </div>

      {/* Bottom Section - Secondary Navigation */}
      <div className="bg-white/95 shadow-md border-b border-gray-200 py-3">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            {/* Search & Filter */}
            <div className="flex items-center gap-4">
              
              {/* Search Bar */}
              <div className="hidden lg:flex items-center bg-white/80 rounded-full px-4 py-2 min-w-[250px] border border-gray-200">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search events..."
                  className="bg-transparent outline-none text-sm flex-1 text-gray-700"
                />
              </div>

              {/* Filter Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="hidden md:flex items-center gap-2 border-gray-300 bg-white/80 hover:bg-white"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>

            </div>

            {/* Main Navigation Links */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
              
              {/* All Events */}
              <Link 
                href="/events" 
                className="flex flex-col items-center group hover:text-[#6A011D] transition-colors"
              >
                <Globe className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">All Events</span>
              </Link>

              {/* Happening Today */}
              <Link 
                href="/events/today" 
                className="flex flex-col items-center group hover:text-[#6A011D] transition-colors"
              >
                <Calendar className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Happening Today</span>
              </Link>

              {/* Browse Categories */}
              <Link 
                href="/browse-by-category" 
                className="flex flex-col items-center group hover:text-[#6A011D] transition-colors"
              >
                <svg className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-sm font-medium">Categories</span>
              </Link>

              {/* Add Event */}
              <Link 
                href="/organizer/auth" 
                className="flex flex-col items-center group hover:text-[#6A011D] transition-colors"
              >
                <Plus className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add Event</span>
              </Link>

            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden mt-4">
            <div className="flex items-center bg-white/80 rounded-full px-4 py-2 border border-gray-200">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search events..."
                className="bg-transparent outline-none text-sm flex-1 text-gray-700"
              />
              <Button size="sm" variant="ghost" className="ml-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default NavbarCombined;