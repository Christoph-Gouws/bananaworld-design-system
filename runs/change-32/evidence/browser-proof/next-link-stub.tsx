// Stand-in for `next/link` in the proof page only: a real <a> that moves the proof's own path state.
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
          window.dispatchEvent(new CustomEvent("proof-navigate", { detail: href }));
        }}
        {...rest}
      />
    );
  },
);
export default Link;
