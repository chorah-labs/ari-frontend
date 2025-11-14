import { useEffect, useState } from "react";

export const useTypewriter = (text: string, speed = 25) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      return;
    }

    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      setDisplayed(prev => {
        const next = text.slice(0, i + 1);
        i++;
        if (i >= text.length) clearInterval(interval);
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return displayed;
};