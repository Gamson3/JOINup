"use client";

import { motion } from "framer-motion";
import React from "react";

// Define the type for FeatureCard props
interface FeatureCardProps {
    icon: React.ReactNode;
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

export default FeatureCard