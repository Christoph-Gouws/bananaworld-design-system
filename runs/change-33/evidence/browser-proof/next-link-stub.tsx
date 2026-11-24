// Stand-in for `next/link` in the proof page only: a real <a> that does not navigate.
import { forwardRef, type AnchorHTMLAttributes } from "react";

const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
  function Link({ href, onClick, ...rest }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          event.preventDefault();
        }}
        {...rest}
      />
    );
  },
);
export default Link;
