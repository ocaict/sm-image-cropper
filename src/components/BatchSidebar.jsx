import React, { useState, useRef, useCallback } from "react";

const BatchSidebar = ({
  batch,
  activeIndex,
  onSelect,
  onRemove,
  onAddMore,
  onReorder,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItemIndex = useRef(null);

  const handleDragStart = useCallback((e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Small delay allows the drag ghost to render before dimming
    setTimeout(() => {
      e.target.style.opacity = "0.4";
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    setDragOverIndex(null);
    dragItemIndex.current = null;
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragItemIndex.current !== index) {
      setDragOverIndex(index);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    const dragIndex = dragItemIndex.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    onReorder(dragIndex, dropIndex);
    setDragOverIndex(null);
  }, [onReorder]);

  if (batch.length === 0) return null;

  return (
    <aside className="batch-sidebar" aria-label="Batch images list">
      <div className="batch-items">
        {batch.map((item, index) => (
          <div
            key={item.id}
            className={`batch-item ${index === activeIndex ? "active" : ""} ${dragOverIndex === index ? "drag-over" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelect(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(index);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Image ${index + 1} of ${batch.length}: ${item.name}${index === activeIndex ? ", currently selected" : ""}`}
            aria-pressed={index === activeIndex}
            title={`${item.name}\nDrag to reorder`}
          >
            {/* Drag handle indicator */}
            <div className="drag-handle" aria-hidden="true">
              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                <circle cx="3" cy="2" r="1.5" />
                <circle cx="7" cy="2" r="1.5" />
                <circle cx="3" cy="7" r="1.5" />
                <circle cx="7" cy="7" r="1.5" />
                <circle cx="3" cy="12" r="1.5" />
                <circle cx="7" cy="12" r="1.5" />
              </svg>
            </div>

            <img src={item.image} alt={item.name} draggable={false} />

            {/* Index badge */}
            <div className="batch-index-badge">{index + 1}</div>

            <button
              className="remove-item"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              aria-label={`Remove ${item.name}`}
              title={`Remove ${item.name}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          className="add-batch-item"
          onClick={onAddMore}
          aria-label="Add more images"
          title="Add more images"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default BatchSidebar;
