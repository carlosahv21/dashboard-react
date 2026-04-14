import { useState, useMemo, useEffect } from "react";

/**
 * Common hook for auth pages that use a slider and theme toggling.
 */
export const useAuthSlider = (t) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState("light");

  const slides = useMemo(
    () => [
      {
        title: t("auth.slide1Title"),
        text: t("auth.slide1Description"),
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_MG7Wqc850CDYWrgIuOQT4wWxpLRnp3lmumTfb2HIFCVZmPqznMXqmCaTkZ2E7UO6FRk19nk6v_hEXjuYWkyDohNeyFlAZU8GBj8qlKaPIRa7Mc_hccheBKbr2MBV07aCgPcdMmS1ihldg7Vggea1FNsFUeuM1I7xesAM8WT-0YG-nk_jMfr0ic2lB1H0VHPS2GIUTrNdUmf59C0UJGi22G1lPbwbtdhKWnESONnEhdQhNrTLKYg7qorolB-2we-yd-Fzl3U2H8Y",
      },
      {
        title: t("auth.slide2Title"),
        text: t("auth.slide2Description"),
        image: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1200&auto=format&fit=crop",
      },
      {
        title: t("auth.slide3Title"),
        text: t("auth.slide3Description"),
        image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    [t]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    currentSlide,
    setCurrentSlide,
    theme,
    toggleTheme,
    slides,
  };
};
