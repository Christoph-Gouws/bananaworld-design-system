import { r as __toESM } from "./rolldown-runtime-B-1-B7_t.js";
import { t as require_react } from "./react.js";
import { t as require_react_dom } from "./react-dom.js";
import { t as require_jsx_runtime } from "./react_jsx-runtime.js";
import { r as useLayoutEffect2 } from "./dist-BQBSEe3Z.js";
import { t as Primitive } from "./dist-BfpQjRjn.js";
//#region node_modules/.pnpm/@radix-ui+react-portal@1.1._a201d07b874b71bd93a8c3bc6f0982e5/node_modules/@radix-ui/react-portal/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PORTAL_NAME = "Portal";
var Portal = import_react.forwardRef((props, forwardedRef) => {
	const { container: containerProp, ...portalProps } = props;
	const [mounted, setMounted] = import_react.useState(false);
	useLayoutEffect2(() => setMounted(true), []);
	const container = containerProp || mounted && globalThis?.document?.body;
	return container ? import_react_dom.createPortal(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		...portalProps,
		ref: forwardedRef
	}), container) : null;
});
Portal.displayName = PORTAL_NAME;
//#endregion
export { Portal as t };
