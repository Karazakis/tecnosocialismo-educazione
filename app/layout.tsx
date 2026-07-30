import type {Metadata,Viewport} from "next";
import "./globals.css";

export const metadata:Metadata={
  metadataBase:new URL("https://educazione.tecnosocialismo.com"),
  title:"Educazione — Tecnosocialismo",
  description:"Un LMS aperto per imparare lungo tutta la vita: percorsi completi, laboratori, portfolio e conoscenza condivisa.",
  alternates:{canonical:"/"},
  openGraph:{title:"Educazione — Imparare è un bene comune",description:"Percorsi aperti per ogni età, dal gioco alla formazione continua.",url:"https://educazione.tecnosocialismo.com",siteName:"Tecnosocialismo Educazione",locale:"it_IT",type:"website",images:[{url:"/og.png",width:1536,height:1024,alt:"Educazione — Imparare è un bene comune"}]},
  twitter:{card:"summary_large_image",title:"Educazione — Tecnosocialismo",description:"Imparare è un bene comune.",images:["/og.png"]},
};
export const viewport:Viewport={colorScheme:"dark",themeColor:"#0b1026"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="it"><body>{children}</body></html>}
