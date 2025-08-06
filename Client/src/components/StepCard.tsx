"use client";

import { motion } from "framer-motion";
import React from "react";

interface stepCardProps {
  step: string;
  title: string;
  description: string;
}

const StepCard: React.FC<stepCardProps> = ({ step, title, description }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 bg-white rounded-xl shadow-lg"
    >
      <span className="text-blue-600 text-3xl font-bold">{step}</span>
      <h3 className="text-xl font-bold mt-4">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </motion.div>
  );
};

export default StepCard;
