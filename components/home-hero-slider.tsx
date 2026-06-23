"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const heroSlides = [
  {
    src: "/images/taekwondo-hero.png",
    label: "품새 지도"
  },
  {
    src: "/images/sidekick-hero.jpg",
    label: "옆차기 지도"
  }
];

export function HomeHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div className="hero-image-slider" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`hero-image hero-slide ${activeSlide === index ? "active" : ""}`}
          />
        ))}
      </div>
      <div className="hero-slide-dots" aria-label="메인 이미지 선택">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={activeSlide === index ? "active" : ""}
            aria-label={`${slide.label} 이미지 보기`}
            aria-pressed={activeSlide === index}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </div>
    </>
  );
}
