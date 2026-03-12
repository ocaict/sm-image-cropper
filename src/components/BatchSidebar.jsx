import React from "react";

const BatchSidebar = ({
  batch,
  activeIndex,
  onSelect,
  onRemove,
  onAddMore,
}) => {
  if (batch.length === 0) return null;

  return (
    <aside className="batch-sidebar" aria-label="Batch images list">
      <div className="batch-items">
        {batch.map((item, index) => (
          <div
            key={item.id}
            className={`batch-item ${index === activeIndex ? "active" : ""}`}
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
          >
            <img src={item.image} alt={item.name} />
            <button
              className="remove-item"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              aria-label={`Remove ${item.name}`}
              title={`Remove ${item.name}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default BatchSidebar;
