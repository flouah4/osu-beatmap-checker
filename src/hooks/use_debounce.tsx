import { useEffect, useState } from "react";

export function useDebounce(text: string, waitMs: number = 1000) {
  const [value, setValue] = useState<string>(text);

  useEffect(() => {
    const timeout = setTimeout(() => setValue(text), waitMs);
    return () => clearTimeout(timeout);
  }, [text]);

  return { value };
}
