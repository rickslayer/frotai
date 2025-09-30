import { cn } from "@/lib/utils";

// ATENÇÃO: O conteúdo deste SVG é um placeholder.
// Por favor, copie o conteúdo do seu arquivo 'logo-frotaai.svg' e cole aqui dentro,
// substituindo este SVG de exemplo.
const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
    {...props}
  >
    <path d="M14 16.5V14a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v2.5" />
    <path d="M14 14.5V12a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v2.5" />
    <path d="M20 10h-2a2 2 0 0 0-2 2v6H8a2 2 0 0 1-2-2v-3.5a2 2 0 0 1 2-2h3" />
    <path d="M19 8h-2.1a2 2 0 0 0-1.9.9l-2.1 3.2c-.2.2-.4.4-.7.5" />
    <path d="M10 6H9a2 2 0 0 0-2 2v3.5a2 2 0 0 0 2 2h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export default Logo;
