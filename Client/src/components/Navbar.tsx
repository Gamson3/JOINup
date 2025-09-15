import Link from "next/link";
import { Button } from "./ui/button";

const Navbar = () => {
    return (
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 backdrop-blur-md bg-white/10 border-b border-white/10 text-white z-50">
        {/* Logo */}
        <div className="text-2xl text-white font-bold tracking-wide" style={{ fontFamily: "var(--font-sans)" }}>
          JOINup
        </div>
  
        {/* Center Text (Hidden on small screens) */}
        <p className="hidden md:block text-white text-sm">
          End-to-end tools to simplify your conference management process.
        </p>
  
        {/* Buttons */}
        {/* lets use just sign in for the sign in/sign up button */}
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="secondary" className="bg-white hover:bg-muted text-text rounded-sm cursor-pointer">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-primary text-white hover:bg-primary/90 rounded-sm cursor-pointer">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>
    );
  };

export default Navbar