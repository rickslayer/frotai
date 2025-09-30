import { cn } from "@/lib/utils";

const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 20"
    className={cn("text-foreground", className)}
    {...props}
  >
    {/*
      Por favor, substitua o conteúdo deste SVG pelo conteúdo do seu arquivo 'logo-frotaai.svg'.
      Abra o arquivo .svg em um editor de texto, copie todo o código e cole aqui,
      substituindo este comentário e o <text> abaixo.
    */}
    <text x="50" y="15" fontSize="14" textAnchor="middle" fill="currentColor">
      Frota.AI
    </text>
  </svg>
);

export default Logo;
