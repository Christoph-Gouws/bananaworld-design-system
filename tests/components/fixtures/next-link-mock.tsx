// Stand-in for `next/link`: renders an <a> and exposes a controllable per-link status to its children,
// the way the real Link does for `useLinkStatus`. Drive it with setPending(href, true|false).
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useSyncExternalStore,
  type ReactElement,
  type ComponentPropsWithoutRef,
} from "react";

const pendingHrefs = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

export function setPending(href: string, pending: boolean): void {
  if (pending) pendingHrefs.add(href);
  else pendingHrefs.delete(href);
  version += 1;
  listeners.forEach((l) => l());
}
export function resetPending(): void {
  pendingHrefs.clear();
  version += 1;
}

const StatusContext = createContext<{ pending: boolean }>({ pending: false });

export function useLinkStatus(): { pending: boolean } {
  return useContext(StatusContext);
}

type MockProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  prefetch?: boolean;
  legacyBehavior?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

const NextLinkMock = forwardRef<HTMLAnchorElement, MockProps>(function NextLinkMock(
  { href, prefetch, legacyBehavior, children, replace: _r, scroll: _s, ...rest },
  ref,
) {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
  const status = { pending: pendingHrefs.has(href) };
  if (legacyBehavior) {
    const only = Children.only(children) as ReactElement<Record<string, unknown>>;
    return isValidElement(only) ? cloneElement(only, { href, ...rest }) : null;
  }
  return (
    <StatusContext.Provider value={status}>
      <a ref={ref} href={href} data-prefetch={String(prefetch)} {...rest}>
        {children}
      </a>
    </StatusContext.Provider>
  );
});

export default NextLinkMock;
