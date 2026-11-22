import { r as __toESM } from "./rolldown-runtime-B-1-B7_t.js";
import { t as require_react } from "./react.js";
import { r as useLayoutEffect2 } from "./dist-BQBSEe3Z.js";
//#region node_modules/.pnpm/@radix-ui+react-id@1.1.2_@types+react@19.2.17_react@19.2.7/node_modules/@radix-ui/react-id/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var useReactId = import_react[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
	const [id, setId] = import_react.useState(useReactId());
	useLayoutEffect2(() => {
		if (!deterministicId) setId((reactId) => reactId ?? String(count++));
	}, [deterministicId]);
	return deterministicId || (id ? `radix-${id}` : "");
}
//#endregion
export { useId as t };
