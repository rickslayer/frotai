import { cn } from "@/lib/utils";

const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 20"
    className={cn("text-foreground", className)}
    {...props}
  >
    {/*
      Este arquivo não está mais em uso, mas é mantido para referência futura.
      O logo foi movido diretamente para 'src/components/dashboard/sidebar.tsx'
      para permitir a estilização de parte do texto.
    */}
    <text x="50" y="15" fontSize="14" textAnchor="middle" fill="currentColor">
      Frota.AI
    </text>
  </svg>
);

export default Logo;
