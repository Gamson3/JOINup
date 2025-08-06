"use client";

import Link from "next/link";
import { Globe, Calendar, Plus, Search, Filter } from "lucide-react";
import { Button } from "./ui/button";

const SecondaryNavbar = () => {
  return (
    <nav className="sticky top-0 bg-white shadow-md border-b border-gray-200 z-40 py-4">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          {/* Secondary Actions */}
          <div className="flex items-center gap-4">
            
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-gray-200 rounded px-4 py-2 min-w-[250px]">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search events..."
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>

            {/* Filter Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="hidden md:flex items-center gap-2 border-gray-300 rounded"
            >
              <Filter className="h-3 w-3" />
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
              <Globe className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm">All Events</span>
            </Link>

            {/* Happening Today */}
            <Link 
              href="/events/today" 
              className="flex flex-col items-center group hover:text-[#6A011D] transition-colors"
            >
              <Calendar className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Happening Today</span>
            </Link>

            {/* Add Event */}
            <Link 
              href="/organizer/auth" 
              className="flex flex-col items-center group hover:text-[#6A011D] transition-colors"
            >
              <Plus className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Add Event</span>
            </Link>

            {/* Quick Search */}
            <div className="flex flex-col items-center group">
              <Search className="h-4 w-4 mb-1 text-gray-500" />
              <span className="text-sm text-gray-500">Quick Search</span>
            </div>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mt-4">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search events..."
              className="bg-transparent outline-none text-sm flex-1"
            />
            <Button size="sm" variant="ghost" className="ml-2">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default SecondaryNavbar;