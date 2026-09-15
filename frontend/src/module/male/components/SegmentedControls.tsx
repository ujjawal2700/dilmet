interface SegmentedControlsProps {
  options: { id: string; label: string }[];
  selectedOption: string;
  onOptionChange: (optionId: string) => void;
}

export const SegmentedControls = ({
  options,
  selectedOption,
  onOptionChange,
}: SegmentedControlsProps) => {
  return (
    <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-[#342b1a] p-1">
      {options.map((option) => (
        <label
          key={option.id}
          className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 transition-all ${
            selectedOption === option.id
              ? 'bg-white dark:bg-[#4a3e26] shadow-sm text-[#111418] dark:text-white'
              : 'text-gray-500 dark:text-[#8a7f6b]'
          }`}
        >
          <span className="truncate text-sm font-medium leading-normal">{option.label}</span>
          <input
            type="radio"
            name="history_filter"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => onOptionChange(option.id)}
            className="invisible w-0 absolute"
          />
        </label>
      ))}
    </div>
  );
};

