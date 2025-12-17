import Image from "next/image";

export default function Home() {
  return (
    // Main Container
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans text-black">
      
      {/* Card */}
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl">
        
        {/* Logo Section */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/binah_logo.png"
            alt="Binah Shidduchim Logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>

        {/* Title & Subtitle */}
        <h1 className="mb-2 text-3xl font-bold text-zinc-900">
          Shidduch Gmach Binah
        </h1>
        <p className="mb-8 text-lg text-zinc-600">
          Please select a language to submit a new profile.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <a
            href="https://forms.shidduch-gmach.org/english"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-zinc-800"
          >
            English Form
          </a>

          <a
            href="https://forms.shidduch-gmach.org/hebrew"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl border-2 border-black bg-white py-4 text-lg font-semibold text-black transition hover:bg-zinc-50"
          >
            טופס בעברית (Hebrew Form)
          </a>
        </div>

        {/* Divider */}
        <hr className="my-8 border-zinc-200" />

        {/* Existing Users Note */}
        <div className="text-zinc-600">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Already submitted a profile?
          </h3>
          <p className="mb-2 text-sm leading-relaxed">
            To <strong>edit</strong> or <strong>delete</strong> your submission, please click the
            unique &quot;Manage&quot; link found in the confirmation email we sent you.
          </p>
          <p className="text-xs italic text-zinc-400">
            (We do not use passwords—your email link is your secure access key.)
          </p>
        </div>
      </div>
    </div>
  );
}