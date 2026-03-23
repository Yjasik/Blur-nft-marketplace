declare module '@web3uikit/icons' {
  import { SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    fontSize?: string | number;
    className?: string;
  }
  
  export const Arrow: React.FC<IconProps>;
  export const Eth: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  // Добавьте другие иконки по мере необходимости
}
