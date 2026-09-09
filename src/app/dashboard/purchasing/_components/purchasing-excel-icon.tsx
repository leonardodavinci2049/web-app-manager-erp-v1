import type { SVGProps } from "react";

export function PurchasingExcelIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M14 2H6.5A1.5 1.5 0 0 0 5 3.5v17A1.5 1.5 0 0 0 6.5 22h11a1.5 1.5 0 0 0 1.5-1.5V7z"
        fill="#107C41"
      />
      <path d="M14 2v3.5A1.5 1.5 0 0 0 15.5 7H19z" fill="#33C481" />
      <path
        d="M9.7 9.9l4.6 4.9M14.3 9.9l-4.6 4.9"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
