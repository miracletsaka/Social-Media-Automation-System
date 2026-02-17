// src/lib/fonts.ts
import { Inter, Poppins, Montserrat, Playfair_Display, Bebas_Neue, Oswald, DM_Sans } from "next/font/google";

export const fontInter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const fontPoppins = Poppins({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-poppins" });
export const fontMontserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
export const fontPlayfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
export const fontBebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"], variable: "--font-bebas" });
export const fontOswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
export const fontDMSans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans" });

export const fontVars = [
  fontInter.variable,
  fontPoppins.variable,
  fontMontserrat.variable,
  fontPlayfair.variable,
  fontBebas.variable,
  fontOswald.variable,
  fontDMSans.variable,
].join(" ");
