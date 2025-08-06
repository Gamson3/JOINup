"use client";

import { Calendar, QrCode, Users } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

const FeaturesSection = () => (
  <section className="py-20 text-center bg-white">
    <h2 className="text-4xl font-bold">Why Choose Us?</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
      <FeatureCard
        icon={<Calendar />}
        title="Easy Scheduling"
        description="Create & manage conference schedules effortlessly."
      />
      <FeatureCard
        icon={<Users />}
        title="Speaker Management"
        description="Approve & assign speakers with ease."
      />
      <FeatureCard
        icon={<QrCode />}
        title="QR Code Attendance"
        description="Seamless attendee check-in with QR scanning."
      />
    </div>
    <p className="text-gray-800 mt-8 max-w-3xl mx-auto">
      Our platform is built with organizers and attendees in mind. Whether
      you're running a small workshop or a multi-day international conference,
      our tools help you stay organized and deliver a smooth experience from
      registration to post-event engagement.
    </p>
    <p className="text-gray-800 mt-4 max-w-3xl mx-auto">
      No need to juggle between spreadsheets, emails, and third-party
      tools—ConferenceMaster brings everything together so you can focus on what
      truly matters: creating meaningful connections and unforgettable events.
    </p>
  </section>
);

export default FeaturesSection;
