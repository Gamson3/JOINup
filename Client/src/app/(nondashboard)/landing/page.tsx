import React from "react";

import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorks from "./HowItWorks";
import CTASection from "./CTASection";
import FooterSection from "./FooterSection";
import SecondaryNavbar from "@/components/SecondaryNavbar";
import FeaturedEvents from "@/components/FeaturedEvents";


const Landing = () => {
  return (
    <div>
        <HeroSection />
        <SecondaryNavbar />
        <FeaturedEvents />
        <FeaturesSection />
        <HowItWorks />
        <CTASection />
        <FooterSection />
    </div>
  )
}

export default Landing