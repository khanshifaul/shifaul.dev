import { useMediaQuery } from "react-responsive";

export type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

export const useWindowSize = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isTablet = useMediaQuery({ query: "(min-width: 768px) and (max-width: 1279px)" });
  const isLaptop = useMediaQuery({ query: "(min-width: 1280px) and (max-width: 1919px)" });
  const isDesktop = useMediaQuery({ query: "(min-width: 1920px)" });

  const deviceType: DeviceType = isMobile ? "mobile" : isTablet ? "tablet" : isLaptop ? "laptop" : "desktop";

  // For compatibility, provide window width/height (direct access is efficient enough)
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  const height = typeof window !== "undefined" ? window.innerHeight : 768;

  return {
    width,
    height,
    deviceType,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
  };
};
