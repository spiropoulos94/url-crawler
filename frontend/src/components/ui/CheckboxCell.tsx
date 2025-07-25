import React from "react";

export interface CheckboxCellProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
  isSelectAll?: boolean;
}

export const CheckboxCell: React.FC<CheckboxCellProps> = ({
  checked,
  onChange,
  className = "",
  "aria-label": ariaLabel,
  isSelectAll = false,
}) => {
  const inputId = React.useId();
  const defaultAriaLabel = isSelectAll 
    ? "Select all rows" 
    : "Select this row";
  return (
    <td className={`px-4 py-3 ${className}`} role="cell">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
        onClick={(e) => e.stopPropagation()}
        aria-label={ariaLabel || defaultAriaLabel}
      />
    </td>
  );
};
