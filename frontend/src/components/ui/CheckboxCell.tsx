import React from "react";

export interface CheckboxCellProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CheckboxCell: React.FC<CheckboxCellProps> = ({
  checked,
  onChange,
  className = "",
}) => {
  return (
    <td className={`px-4 py-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
      />
    </td>
  );
};
