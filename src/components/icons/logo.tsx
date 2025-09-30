import { cn } from "@/lib/utils";

const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    id="Compass-90"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    viewBox="0 0 99 106.2"
    className={cn("text-primary", className)}
    {...props}
  >
    {/* Generator: Adobe Illustrator 29.8.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 2)  */}
    <defs>
      <style>
        {`
          .st0, .st1 {
            fill: #fff;
          }
          .st2 {
            fill: #2a62ff;
          }
          .st1 {
            stroke: #2a62ff;
            stroke-miterlimit: 10;
            stroke-width: 3.8px;
          }
        `}
      </style>
    </defs>
    <path className="st2" d="M85.7,66.1c-7.5,12.5-17.1,14.5-25.4,23.1-4,4.1-9.9,24.7-15.1,13.9-8.6-17.8-8-12.6-21.5-24.4C-5.4,53.3,3.6,5.7,42.4,.4c36.9-5,62.9,33.1,43.3,65.6Z"/>
    <circle className="st0" cx="49.5" cy="43.6" r="35.6"/>
    <g>
      <path className="st1" d="M48.8,53.9c4.1.4,7.8-2.7,8.2-6.8.4-4.1-2.7-7.8-6.8-8.2-4.1-.4-7.8,2.7-8.2,6.8-.4,4.1,2.7,7.8,6.8,8.2Z"/>
      <path className="st1" d="M4.7,86l57.1-25.1c.3-.2.6-.4.9-.7L96.8,9.8c1.1-1.7-.6-3.8-2.5-3l-57.1,25.1c-.3.2-.6.4-.9.7L2.2,83.1c-1.1,1.7.6,3.8,2.5,3ZM50.2,38.9c4.1.4,7.2,4.1,6.8,8.2-.4,4.1-4.1,7.2-8.2,6.8-4.1-.4-7.2-4.1-6.8-8.2.4-4.1,4.1-7.2,8.2-6.8Z"/>
    </g>
    <circle className="st2" cx="49.5" cy="46.4" r="7.5"/>
  </svg>
);

export default Logo;
