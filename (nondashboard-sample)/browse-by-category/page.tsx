import React from "react";
import { GraduationCap, Briefcase, Monitor, DollarSign, Building, Users, Plane, Heart, Car, Home, Utensils, Camera } from "lucide-react";

const BrowseByCategory = () => {
  const categories = [
    { 
      name: "Education & Training", 
      count: "245.8k Events", 
      icon: GraduationCap,
      href: "/events/category/education"
    },
    { 
      name: "Medical & Pharma", 
      count: "111.4k Events", 
      icon: Heart,
      href: "/events/category/medical"
    },
    { 
      name: "IT & Technology", 
      count: "112.6k Events", 
      icon: Monitor,
      href: "/events/category/technology"
    },
    { 
      name: "Banking & Finance", 
      count: "65.2k Events", 
      icon: DollarSign,
      href: "/events/category/finance"
    },
    { 
      name: "Business Services", 
      count: "105.9k Events", 
      icon: Building,
      href: "/events/category/business"
    },
    { 
      name: "Manufacturing", 
      count: "89.3k Events", 
      icon: Briefcase,
      href: "/events/category/manufacturing"
    },
    { 
      name: "Travel & Tourism", 
      count: "67.1k Events", 
      icon: Plane,
      href: "/events/category/travel"
    },
    { 
      name: "Food & Beverages", 
      count: "78.5k Events", 
      icon: Utensils,
      href: "/events/category/food"
    },
    { 
      name: "Automotive", 
      count: "45.7k Events", 
      icon: Car,
      href: "/events/category/automotive"
    },
    { 
      name: "Home & Office", 
      count: "92.4k Events", 
      icon: Home,
      href: "/events/category/home"
    },
    { 
      name: "Fashion & Beauty", 
      count: "56.8k Events", 
      icon: Camera,
      href: "/events/category/fashion"
    },
    { 
      name: "Networking", 
      count: "134.2k Events", 
      icon: Users,
      href: "/events/category/networking"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse By Category</h1>
          <p className="text-lg text-gray-600">Discover events tailored to your interests and industry</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <a
                key={index}
                href={category.href}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group hover:border-[#6A011D]/20"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#6A011D]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#6A011D]/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-[#6A011D]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#6A011D] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <a
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-[#6A011D] text-white rounded-lg hover:bg-[#550117] transition-colors font-medium"
          >
            View All Events
          </a>
        </div>

      </div>
    </div>
  );
};

export default BrowseByCategory;