// Lucide-style icons drawn inline. Outlined, 1.75 stroke, rounded caps.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Icon = ({ size = 22, children, ...p }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {children}
  </svg>
);

export const IArrow = (p: IconProps) => (
  <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>
);
export const ICheck = (p: IconProps) => (
  <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>
);
export const IPlus = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Icon>
);
export const IPlay = (p: IconProps) => (
  <Icon {...p}><path d="M6 4v16l14-8z" fill="currentColor" /></Icon>
);
export const ICopy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Icon>
);
export const IUsers = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);
export const ITrophy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Icon>
);
export const IClock = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
);
export const ICompass = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m16 8-3 6-6 3 3-6 6-3z" fill="currentColor" fillOpacity=".15" />
  </Icon>
);
export const IGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
  </Icon>
);
export const IStore = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M5 9v11h14V9" />
    <path d="M9 22V12h6v10" />
  </Icon>
);
export const IScissors = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88" />
    <path d="M14.47 14.48 20 20" />
    <path d="M8.12 8.12 12 12" />
  </Icon>
);
export const ICalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Icon>
);
export const IUtensils = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 2v7c0 1.66 1.34 3 3 3v10" />
    <path d="M9 2v20" />
    <path d="M21 15V2l-3 3-3-3v13a3 3 0 1 0 6 0z" />
  </Icon>
);
export const IBook = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Icon>
);
export const IHeart = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.79 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);
export const IDumbbell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.4 14.4 9.6 9.6" />
    <path d="M18.66 16.05a3.74 3.74 0 1 0-5.3-5.29" />
    <path d="M21.5 21.5l-1.4-1.4" />
    <path d="M3.9 3.9 2.5 2.5" />
    <path d="M5.34 7.96a3.74 3.74 0 1 0 5.29 5.3" />
  </Icon>
);
export const ICamera = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);
export const IWrench = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.7 6.3a4 4 0 0 0 5.7 5.7L21 21l-9-2.6a4 4 0 0 1-5.7-5.7L14.7 6.3z" />
  </Icon>
);
export const ICalc = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8" />
    <circle cx="8" cy="12" r=".5" fill="currentColor" />
    <circle cx="12" cy="12" r=".5" fill="currentColor" />
    <circle cx="16" cy="12" r=".5" fill="currentColor" />
    <circle cx="8" cy="16" r=".5" fill="currentColor" />
    <circle cx="12" cy="16" r=".5" fill="currentColor" />
    <circle cx="16" cy="16" r=".5" fill="currentColor" />
  </Icon>
);
export const IHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V11z" />
  </Icon>
);
export const ITruck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1 7h13v10H1z" />
    <path d="M14 10h5l3 3v4h-8" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
  </Icon>
);
