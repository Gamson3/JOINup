// "use client"; //Note whenever we use motion we need the client component
import Image from "next/image";
import { Button } from "@/components/ui/button";


const HeroSection = () => (
  <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] flex flex-col justify-center items-center text-center bg-white p-8">
    {/* Background Image - Lowest layer */}
    <Image 
      src="/hero-section-image.jpg"
      alt="Conference Hero Background"
      fill
      className="object-cover object-center z-0"
      priority
    />

    {/* Optional: Dark overlay for better text contrast */}
    <div className="absolute inset-0 bg-black/90 z-5"></div>

    {/* SVG radial splash background */}
    <svg
      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Bottom-left splash */}
        <radialGradient id="splash1" cx="20%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#5686e5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ddd6f3" stopOpacity="0" />
        </radialGradient>
        {/* Bottom-right splash */}
        <radialGradient id="splash2" cx="80%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#CFDEF3" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#CFDEF3" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Apply both radial gradients */}
      <rect width="100%" height="100%" fill="url(#splash1)" />
      <rect width="100%" height="100%" fill="url(#splash2)" />
    </svg>

    {/* Content - Top layer */}
    <div className="text-white max-w-[80%] mx-auto px-16 sm:px-12 z-20 relative">
      <h1 className="text-5xl">
        Conference solutions that make your participants and you happy! 
      </h1>
      <p className="mt-4 text-lg text-gray-400">
        Organize, schedule, and manage conferences with ease.
      </p>
    </div>

    <div className="mt-6 flex gap-4 z-20">
      <Button 
       className="px-6 py-5 bg-primary text-white hover:bg-primary/90 rounded-sm shadow-lg cursor-pointer"
      >
        Get Started
      </Button>
      <Button
      //  variant="outline" 
       className="px-6 py-5 bg-white text-text hover:bg-muted rounded-sm shadow-lg cursor-pointer"
      >
        Learn More
      </Button>
    </div>
  </section>
);

export default HeroSection;
