import { useEffect, useState } from "react";

const getInitialValue = () => {
if (typeof window === "undefined") {
return false;
}

return window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;
};

const usePrefersReducedMotion = () => {
const [prefersReducedMotion, setPrefersReducedMotion] =
useState(getInitialValue);

useEffect(() => {
if (typeof window === "undefined") {
return;
}


const mediaQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const handleChange = (event) => {
  setPrefersReducedMotion(event.matches);
};

// Modern browsers
if (mediaQuery.addEventListener) {
  mediaQuery.addEventListener(
    "change",
    handleChange
  );
} else {
  // Older browser support
  mediaQuery.addListener(handleChange);
}

return () => {
  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener(
      "change",
      handleChange
    );
  } else {
    mediaQuery.removeListener(handleChange);
  }
};

}, []);

return prefersReducedMotion;
};

export default usePrefersReducedMotion;
