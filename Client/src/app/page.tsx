"use client";
// import React from "react";


import { motion } from "motion/react";
import { ArrowRight, Calendar, Users, QrCode, DivideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the type for FeatureCard props
interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

// FeatureCard Component with TypeScript props
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-gray-100 rounded-xl shadow-lg">
      <div className="flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mt-4">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </motion.div>
  );
};

// Define the type for StepCard props
interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

// StepCard Component with TypeScript props
const StepCard: React.FC<StepCardProps> = ({ step, title, description }) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-white rounded-xl shadow-lg">
      <span className="text-blue-600 text-3xl font-bold">{step}</span>
      <h3 className="text-xl font-bold mt-4">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </motion.div>
  );
};

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-transparent text-white z-50">
      {/* Logo */}
      <div className="text-2xl font-bold tracking-wide" style={{ fontFamily: "var(--font-sans)" }}>
        ConferenceMaster
      </div>

      {/* Center Text (Hidden on small screens) */}
      <p className="hidden md:block text-gray-700 text-sm">
        End-to-end tools to simplify your conference management process.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
          Sign In
        </Button>
        <Button className="bg-black text-white hover:bg-gray-800">
          Sign Out
        </Button>
      </div>
    </nav>
  );
};

export default function Home() {
  return (
    <div className="bg-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className=" relative h-screen flex flex-col justify-center items-center text-center bg-gradient-to-r from-[#E0EAFC] to-[#CFDEF3] text-gray p-8">
          <div className="max-w-[80%] mx-auto px-16 sm:px-12">
            <h1 className="text-5xl">Conference solutions that make your participants and you happy!</h1>
            <p className="mt-4 text-lg text-gray-700">Organize, schedule, and manage conferences with ease.</p>
          </div>
        
        <div className="mt-6 flex gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl shadow-lg hover:bg-gray-200">
            Get Started
          </button>
          <button className="bg-transparent border-2 border-white px-6 py-3 rounded-xl">
            Learn More
          </button>
          {/* <Button className="bg-transparent border-2 border-white px-6 py-3 rounded-xl">shadcn Button</Button> */}
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 text-center bg-white">
        <h2 className="text-4xl font-bold">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
          <FeatureCard icon={<Calendar />} title="Easy Scheduling" description="Create & manage conference schedules effortlessly." />
          <FeatureCard icon={<QrCode />} title="QR Code Attendance" description="Seamless attendee check-in with QR scanning." />
          <FeatureCard icon={<Users />} title="Speaker Management" description="Upload & assign speakers with ease." />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-200 text-center">
        <h2 className="text-4xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
          <StepCard step="1" title="Create a Conference" description="Set up your event details and schedule." />
          <StepCard step="2" title="Invite Speakers" description="Upload presentations & manage speakers." />
          <StepCard step="3" title="Track Attendance" description="Use QR codes for seamless check-in." />
        </div>
      </section>

      {/* Upcoming Conferences */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-4xl font-bold">Upcoming Conferences</h2>
        <p className="text-gray-500 mt-4">Stay tuned for upcoming events!</p>
      </section>

      {/* Call-To-Action */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-4xl font-bold">Ready to Simplify Your Conference Management?</h2>
        <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl shadow-lg hover:bg-gray-200">
          Sign Up Now
        </button>
      </section>
    </div>
  );
}
