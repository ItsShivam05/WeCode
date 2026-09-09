import weCodeLogo from '../../assests/WeCodeLogo.png';

type LogoProps = {
  className?: string;
  alt?: string;
};

export const Logo = ({ className = '', alt = 'WeCode logo' }: LogoProps) => {
  return (
    <img
      src={weCodeLogo}
      alt={alt}
      className={['w-auto object-contain select-none', className].join(' ')}
      draggable={false}
    />
  );
};
