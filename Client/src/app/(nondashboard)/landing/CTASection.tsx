import Link from "next/link";
import Image from "next/image"
import { Button } from "@/components/ui/button";

const CTASection = () => (
    <section className="relative py-20 text-white text-center">
      <Image 
        src="/call-to-action.jpg"
        alt="ConferenceMaster Search Section Background"
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/90"></div>
      <div 
        className="relative max-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 lg:px-12   xl:px-16 py-12 z-10"
      >
        <div className="flex flex-col items-center">
          <div className="mb-6 md:mb-0 md:mr-10">
            <h2 className="text-3xl sm:text-2xl font-bold mb-6">
              Ready to Simplify Your Conference Management?
            </h2>
          </div>
          <div>
            <p className="mb-8">
                Join organizers around the world who are streamlining their conferences with our all-in-one platform.
            </p>
            <Button 
              className="bg-white text-blue-600 px-6 py-3 rounded-xl shadow-lg hover:bg-gray-200 h-12 cursor-pointer"
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
  
  export default CTASection;
  