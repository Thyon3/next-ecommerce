import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T>(value: T, limit: number) => {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  useEffect(() => {
    let inThrottle = false;
    const handler = () => {
      if (!inThrottle) {
        setThrottledValue(value);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };

    handler();
  }, [value, limit]);

  return throttledValue;
};

export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = () => setValue(prev => !prev);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return [value, setValue, toggle, setTrue, setFalse] as const;
};

export const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = useState<number>(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);
  const set = (value: number) => setCount(value);

  return [count, setCount, increment, decrement, reset, set] as const;
};

export const useArray = <T>(initialValue: T[] = []) => {
  const [array, setArray] = useState<T[]>(initialValue);

  const add = (item: T) => setArray(prev => [...prev, item]);
  const remove = (index: number) => setArray(prev => prev.filter((_, i) => i !== index));
  const update = (index: number, item: T) => setArray(prev => prev.map((item, i) => i === index ? item : item));
  const clear = () => setArray([]);

  return [array, setArray, add, remove, update, clear] as const;
};

export const useObject = <T extends Record<string, any>>(initialValue: T) => {
  const [object, setObject] = useState<T>(initialValue);

  const update = (key: keyof T, value: T[keyof T]) => 
    setObject(prev => ({ ...prev, [key]: value }));
  const remove = (key: keyof T) => {
    const newObject = { ...object };
    delete newObject[key];
    setObject(newObject);
  };
  const clear = () => setObject({} as T);

  return [object, update, remove, clear] as const;
};

export const useAsyncStorage = <T>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        if (typeof window !== 'undefined') {
          const item = window.localStorage.getItem(key);
          if (item) {
            const value = JSON.parse(item);
            setState(value);
          }
        }
      } catch (error) {
        console.error(`Error loading async storage key "${key}":`, error);
      }
    };

    loadValue();
  }, [key]);

  const saveValue = async (value: T) => {
    try {
      setState(value);
      if (typeof window !== 'undefined') {
        await window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving async storage key "${key}":`, error);
    }
  };

  return [state, saveValue];
};
