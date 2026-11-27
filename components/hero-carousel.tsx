"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

type Slide = {
  src: string;
  alt: string;
  place: string;
  credit?: {
    author: string;
    source: string;
    license: string;
    licenseUrl: string;
  };
};

const slides: Slide[] = [
  {
    src: "/fuji.jpg",
    alt: "Gunung Fuji dan Pagoda Chureito di Jepang",
    place: "Gunung Fuji, Jepang",
  },
  {
    src: "/fushimi-inari.jpg",
    alt: "Kuil Fushimi Inari di Kyoto",
    place: "Fushimi Inari, Kyoto",
    credit: {
      author: "Jakub Hałun",
      source:
        "https://commons.wikimedia.org/wiki/File:Fushimi_Inari-taisha,_Kyoto,_20240818_1343_4411.jpg",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    src: "/himeji-castle.jpg",
    alt: "Kastil Himeji dengan bangunan putih dan taman di sekitarnya",
    place: "Kastil Himeji, Hyogo",
    credit: {
      author: "Bernard Gagnon",
      source: "https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Himeji02.jpg",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    },
  },
  {
    src: "/kinkakuji.jpg",
    alt: "Paviliun Emas Kinkaku-ji di tepi kolam di Kyoto",
    place: "Kinkaku-ji, Kyoto",
    credit: {
      author: "Jaycangel",
      source:
        "https://commons.wikimedia.org/wiki/File:Kinkaku-ji_the_Golden_Temple_in_Kyoto_overlooking_the_lake_-_high_rez.JPG",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    },
  },
  {
    src: "/tokyo-minato.jpg",
    alt: "Cakrawala gedung-gedung Tokyo dengan Tokyo Tower",
    place: "Minato, Tokyo",
    credit: {
      author: "David Kernan",
      source: "https://commons.wikimedia.org/wiki/File:Minato_City,_Tokyo,_Japan.jpg",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
  },
];
const loopedSlides = [slides[slides.length - 1], ...slides, slides[0]];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const pointerStart = useRef<{
    x: number;
    y: number;
    dragging: boolean;
  } | null>(null);

  function normalizePosition(next: number) {
    if (next < 0) return next + slides.length;
    if (next > slides.length + 1) return next - slides.length;
    return next;
  }

  function move(offset: number) {
    setActive((current) => (current + offset + slides.length) % slides.length);
    setPosition((current) => normalizePosition(current + offset));
  }

  function goTo(index: number) {
    const forward = (index - active + slides.length) % slides.length;
    const backward = forward - slides.length;
    const offset =
      Math.abs(forward) <= Math.abs(backward) ? forward : backward;
    setActive(index);
    setPosition((current) => normalizePosition(current + offset));
  }

  function onTrackTransitionEnd(event: ReactTransitionEvent<HTMLDivElement>) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform" ||
      (position !== 0 && position !== slides.length + 1)
    )
      return;

    setTransitionEnabled(false);
    setPosition(position === 0 ? slides.length : 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionEnabled(true));
    });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      (event.pointerType === "mouse" && event.button !== 0) ||
      (event.target instanceof Element && event.target.closest("a"))
    )
      return;
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      dragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        pointerStart.current = null;
        return;
      }
      if (Math.abs(deltaX) < 8) return;
      start.dragging = true;
      setDragging(true);
    }

    const limit = event.currentTarget.clientWidth * 0.8;
    setDragOffset(Math.max(-limit, Math.min(limit, deltaX)));
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const threshold = Math.max(
      40,
      Math.min(80, event.currentTarget.clientWidth * 0.18),
    );
    if (start.dragging && Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) move(1);
      else move(-1);
    }
    pointerStart.current = null;
    setDragging(false);
    setDragOffset(0);
  }

  function onPointerCancel() {
    pointerStart.current = null;
    setDragging(false);
    setDragOffset(0);
  }

  return (
    <div className="hero-carousel-wrap">
      <div
        className="hero-carousel"
        role="region"
        aria-label="Galeri foto Jepang"
        aria-roledescription="carousel"
      >
        <div
          className="hero-carousel-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerCancel}
        >
          <div
            className={[
              "hero-carousel-track",
              dragging && "is-dragging",
              !transitionEnabled && "no-transition",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              transform: `translate3d(calc(-${position * 100}% + ${dragOffset}px), 0, 0)`,
            }}
            onTransitionEnd={onTrackTransitionEnd}
          >
            {loopedSlides.map((slide, index) => {
              const slideIndex = (index - 1 + slides.length) % slides.length;
              const current = index === position;
              return (
                <figure
                  key={`${index}-${slide.src}`}
                  className="hero-carousel-slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${slideIndex + 1} dari ${slides.length}: ${slide.place}`}
                  aria-hidden={!current}
                  inert={!current}
                >
                  <img src={slide.src} alt={slide.alt} draggable={false} />
                  <figcaption>
                    <span className="carousel-location">
                      <MapPin aria-hidden="true" />
                      {slide.place}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="carousel-dots" role="group" aria-label="Pilih foto">
            {slides.map((item, index) => (
              <button
                key={item.src}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Foto ${index + 1}: ${item.place}`}
                aria-pressed={active === index}
              />
            ))}
          </div>
          <span className="sr-only" aria-live="polite">
            {slides[active].place}, foto {active + 1} dari {slides.length}
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Foto berikutnya"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* <details className="carousel-attributions">
        <summary>Atribusi foto</summary>
        <ul>
          {slides.map((slide) =>
            slide.credit ? (
              <li key={slide.src}>
                {slide.place} — Foto oleh {slide.credit.author}.{" "}
                <a
                  href={slide.credit.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sumber foto
                </a>
                {" · "}
                <a
                  href={slide.credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {slide.credit.license}
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </details> */}
    </div>
  );
}
