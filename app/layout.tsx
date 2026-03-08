import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Precifica SaaS",
  description: "Plataforma de precificação com histórico, PDF e acesso em nuvem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={plusJakarta.className}>
        {children}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>Suporte:</span>
            <a href="mailto:luizguilherme@benchmarkcontabil.com.br">luizguilherme@benchmarkcontabil.com.br</a>
            <span>•</span>
            <a href="https://wa.me/5534997802210" target="_blank" rel="noreferrer">WhatsApp: (34) 99780-2210</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
