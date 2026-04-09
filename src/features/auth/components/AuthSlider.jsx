import React from "react";

const AuthSlider = ({ slides, currentSlide, setCurrentSlide, t }) => {
  return (
    <div className="login-right-panel">
      <div className="dance-image-overlay">
        <img
          key={currentSlide}
          alt="Bailarín Profesional"
          className="dance-image"
          src={slides[currentSlide].image}
        />
        <div className="dance-gradient-r"></div>
        <div className="dance-gradient-t"></div>
      </div>

      <div className="dance-content-box">
        <div className="dance-text-wrapper">
          <div className="pro-badge">
            <span className="pro-badge-dot"></span>
            <span className="pro-text">{t("auth.proBadge")}</span>
          </div>
          <h2 className="hero-title">{slides[currentSlide].title}</h2>
          <p className="hero-desc">{slides[currentSlide].text}</p>
          <div className="hero-dots">
            {slides.map((_, index) => (
              <div
                key={index}
                className={
                  index === currentSlide ? "hero-dot-active" : "hero-dot"
                }
                onClick={() => setCurrentSlide(index)}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="version-tag">{t("auth.versionTag")}</div>
    </div>
  );
};

export default AuthSlider;
