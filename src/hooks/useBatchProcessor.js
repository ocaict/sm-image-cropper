import { useState, useCallback } from "react";

export function useBatchProcessor() {
  const [batch, setBatch] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const addItemToBatch = useCallback((items) => {
    setBatch((prev) => [...prev, ...items]);
  }, []);

  const removeItemFromBatch = useCallback((index) => {
    setBatch((prev) => {
      const nextBatch = prev.filter((_, i) => i !== index);
      return nextBatch;
    });

    setActiveIndex((prev) => {
      if (index === prev) return Math.max(0, index - 1);
      if (index < prev) return prev - 1;
      return prev;
    });
  }, []);

  const updateActiveItem = useCallback((updates) => {
    setBatch((prev) => {
      if (!prev[activeIndex]) return prev;
      // Only update if there are actual changes to prevent infinite loops
      const current = prev[activeIndex];
      const hasChanges = Object.keys(updates).some(key => updates[key] !== current[key]);
      if (!hasChanges) return prev;
      
      return prev.map((item, i) => (i === activeIndex ? { ...item, ...updates } : item));
    });
  }, [activeIndex]);

  const reorderBatch = useCallback((fromIndex, toIndex) => {
    setBatch((prev) => {
      const newBatch = [...prev];
      const [moved] = newBatch.splice(fromIndex, 1);
      newBatch.splice(toIndex, 0, moved);
      return newBatch;
    });

    setActiveIndex((prev) => {
      if (prev === fromIndex) return toIndex;
      if (fromIndex < prev && toIndex >= prev) return prev - 1;
      if (fromIndex > prev && toIndex <= prev) return prev + 1;
      return prev;
    });
  }, []);


  return {
    batch,
    setBatch,
    activeIndex,
    setActiveIndex,
    addItemToBatch,
    removeItemFromBatch,
    updateActiveItem,
    reorderBatch,
    activeItem: batch[activeIndex] || null,
  };
}
