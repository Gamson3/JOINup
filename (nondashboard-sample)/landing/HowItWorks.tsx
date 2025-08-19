"use client";

import StepCard from "@/components/StepCard";

const HowItWorks = () => (
  <section className="py-20 bg-gray-100 text-center">
    <h2 className="text-4xl font-bold">How It Works</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
      <StepCard
        step="1"
        title="Create a Conference"
        description="Set up your event details and dates."
      />
      <StepCard
        step="2"
        title="Assign Speakers"
        description="Approve presentations, manage speakers and build schedules."
      />
      <StepCard
        step="3"
        title="Track Attendance"
        description="Use QR codes for seamless check-in."
      />
    </div>
    <p className="text-gray-600 mt-8 max-w-3xl mx-auto">
      The entire process is streamlined, so you can set up an event in minutes.
      We’ve designed it to be intuitive for first-time users, yet powerful
      enough for seasoned organizers.
    </p>
    <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
      Each step is supported by intelligent automation and built-in best
      practices—saving you time while ensuring accuracy. From speaker onboarding
      to attendee check-ins, everything just works.
    </p>
  </section>
);

export default HowItWorks;
