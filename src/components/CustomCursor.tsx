import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorText, setCursorText] = useState("");
  const [cursorColor, setCursorColor] = useState("bg-glacier");
  const [isVisible, setIsVisible] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let animationId: number;

    const animate = () => {
      // Smooth interpolation
      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.15;
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.15;

      cursor.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let xOffset = 15;
      let yOffset = 20;

      // Adjust position if near edges
      if (e.clientX > windowWidth * 0.75) {
        xOffset = -200;
      }
      if (e.clientY > windowHeight * 0.85) {
        yOffset = -60;
      }

      targetRef.current.x = e.clientX + xOffset;
      targetRef.current.y = e.clientY + yOffset;
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const text = target.getAttribute("data-cursor");
      const color = target.getAttribute("data-cursor-color") || "bg-glacier";
      if (text) {
        setCursorText(text);
        setCursorColor(color);
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Start animation loop
    animationId = requestAnimationFrame(animate);

    // Add global mouse move listener
    window.addEventListener("mousemove", handleMouseMove);

    // Add listeners to all elements with data-cursor
    const targets = document.querySelectorAll("[data-cursor]");
    targets.forEach((target) => {
      target.addEventListener("mouseenter", handleMouseEnter);
      target.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      targets.forEach((target) => {
        target.removeEventListener("mouseenter", handleMouseEnter);
        target.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // Re-attach listeners when DOM changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const targets = document.querySelectorAll("[data-cursor]");
      targets.forEach((target) => {
        target.addEventListener("mouseenter", (e) => {
          const text = (e.target as HTMLElement).getAttribute("data-cursor");
          const color = (e.target as HTMLElement).getAttribute("data-cursor-color") || "bg-glacier";
          if (text) {
            setCursorText(text);
            setCursorColor(color);
            setIsVisible(true);
          }
        });
        target.addEventListener("mouseleave", () => setIsVisible(false));
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 z-[9999] pointer-events-none transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={`${cursorColor} text-white px-4 py-2 rounded-lg text-sm font-medium max-w-[200px] shadow-lg`}>
        {cursorText}
      </div>
    </div>
  );
}
