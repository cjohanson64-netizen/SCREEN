import RepetitionCard from "./RepetitionCard";

export default function RepetitionList({
  items,
  highlightedLines,
  onHighlightLines,
}) {
  return (
    <div className="repetition-list">
      {items.map((item, index) => (
        <RepetitionCard
          key={`${item.pattern}-${index}`}
          item={item}
          highlightedLines={highlightedLines}
          onHighlightLines={onHighlightLines}
        />
      ))}
    </div>
  );
}