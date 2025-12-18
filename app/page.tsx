import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      
      {/* 1. The Big Hero Logo */}
      <div className="relative flex place-items-center mb-8">
        <Image
          className="relative drop-shadow-[0_0_0.3rem_#ffffff70]"
          src="/heart-logo.png"
          alt="Shidduch Gmach Logo"
          width={250}  // Bigger than the header logo
          height={250}
          priority
        />
      </div>

      {/* 2. Welcome Text */}
      <h1 className="text-4xl font-bold mb-4 text-black">
        Welcome to the Portal
      </h1>
      
      <p className="mb-8 text-lg max-w-2xl text-gray-700">
        Please verify your details and manage your shidduch profile securely.
      </p>

      {/* 3. The "Call to Action" Button */}
      <Link href="/me"> 
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-lg text-lg">
          Go to My Profile →
        </button>
      </Link>

    </main>
  );
}