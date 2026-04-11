"use client";

export default function HeroSection() {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A2E]">
        News IA
      </h1>
      <p className="text-lg text-[#4A4A6A]">
        Résumé quotidien de l&apos;intelligence artificielle
      </p>
      <p className="text-sm text-[#4A4A6A]/70 capitalize">{today}</p>
    </div>
  );
}
