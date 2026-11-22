"use client";
import { r as __toESM } from "./rolldown-runtime-B-1-B7_t.js";
import { t as require_react } from "./react.js";
import { t as require_react_dom } from "./react-dom.js";
import { t as require_jsx_runtime } from "./react_jsx-runtime.js";
import { n as DismissableLayer } from "./dist-CNKxplUu.js";
//#region node_modules/.pnpm/@radix-ui+react-context@1.1_b6202f6253012f95316196d753a9ae4c/node_modules/@radix-ui/react-context/dist/index.mjs
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function createContextScope(scopeName, createContextScopeDeps = []) {
	let defaultContexts = [];
	function createContext3(rootComponentName, defaultContext) {
		const BaseContext = import_react.createContext(defaultContext);
		const index = defaultContexts.length;
		defaultContexts = [...defaultContexts, defaultContext];
		const Provider = (props) => {
			const { scope, children, ...context } = props;
			const Context = scope?.[scopeName]?.[index] || BaseContext;
			const value = import_react.useMemo(() => context, Object.values(context));
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Context.Provider, {
				value,
				children
			});
		};
		Provider.displayName = rootComponentName + "Provider";
		function useContext2(consumerName, scope) {
			const Context = scope?.[scopeName]?.[index] || BaseContext;
			const context = import_react.useContext(Context);
			if (context) return context;
			if (defaultContext !== void 0) return defaultContext;
			throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
		}
		return [Provider, useContext2];
	}
	const createScope = () => {
		const scopeContexts = defaultContexts.map((defaultContext) => {
			return import_react.createContext(defaultContext);
		});
		return function useScope(scope) {
			const contexts = scope?.[scopeName] || scopeContexts;
			return import_react.useMemo(() => ({ [`__scope${scopeName}`]: {
				...scope,
				[scopeName]: contexts
			} }), [scope, contexts]);
		};
	};
	createScope.scopeName = scopeName;
	return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
	const baseScope = scopes[0];
	if (scopes.length === 1) return baseScope;
	const createScope = () => {
		const scopeHooks = scopes.map((createScope2) => ({
			useScope: createScope2(),
			scopeName: createScope2.scopeName
		}));
		return function useComposedScopes(overrideScopes) {
			const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
				const currentScope = useScope(overrideScopes)[`__scope${scopeName}`];
				return {
					...nextScopes2,
					...currentScope
				};
			}, {});
			return import_react.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
		};
	};
	createScope.scopeName = baseScope.scopeName;
	return createScope;
}
typeof window !== "undefined" && window.document && window.document.createElement;
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
	return function handleEvent(event) {
		originalEventHandler?.(event);
		if (checkForDefaultPrevented === false || !event.defaultPrevented) return ourEventHandler?.(event);
	};
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-compose-ref_6d3b0875dfa286dbf6256207e9d8f5d1/node_modules/@radix-ui/react-compose-refs/dist/index.mjs
function setRef(ref, value) {
	if (typeof ref === "function") return ref(value);
	else if (ref !== null && ref !== void 0) ref.current = value;
}
function composeRefs(...refs) {
	return (node) => {
		let hasCleanup = false;
		const cleanups = refs.map((ref) => {
			const cleanup = setRef(ref, node);
			if (!hasCleanup && typeof cleanup == "function") hasCleanup = true;
			return cleanup;
		});
		if (hasCleanup) return () => {
			for (let i = 0; i < cleanups.length; i++) {
				const cleanup = cleanups[i];
				if (typeof cleanup == "function") cleanup();
				else setRef(refs[i], null);
			}
		};
	};
}
function useComposedRefs(...refs) {
	return import_react.useCallback(composeRefs(...refs), refs);
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-slot@1.2.3_@types+react@19.2.17_react@19.2.7/node_modules/@radix-ui/react-slot/dist/index.mjs
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
	const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
	const Slot2 = import_react.forwardRef((props, forwardedRef) => {
		const { children, ...slotProps } = props;
		const childrenArray = import_react.Children.toArray(children);
		const slottable = childrenArray.find(isSlottable);
		if (slottable) {
			const newElement = slottable.props.children;
			const newChildren = childrenArray.map((child) => {
				if (child === slottable) {
					if (import_react.Children.count(newElement) > 1) return import_react.Children.only(null);
					return import_react.isValidElement(newElement) ? newElement.props.children : null;
				} else return child;
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotClone, {
				...slotProps,
				ref: forwardedRef,
				children: import_react.isValidElement(newElement) ? import_react.cloneElement(newElement, void 0, newChildren) : null
			});
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotClone, {
			...slotProps,
			ref: forwardedRef,
			children
		});
	});
	Slot2.displayName = `${ownerName}.Slot`;
	return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
	const SlotClone = import_react.forwardRef((props, forwardedRef) => {
		const { children, ...slotProps } = props;
		if (import_react.isValidElement(children)) {
			const childrenRef = getElementRef$1(children);
			const props2 = mergeProps(slotProps, children.props);
			if (children.type !== import_react.Fragment) props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
			return import_react.cloneElement(children, props2);
		}
		return import_react.Children.count(children) > 1 ? import_react.Children.only(null) : null;
	});
	SlotClone.displayName = `${ownerName}.SlotClone`;
	return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
	return import_react.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
	const overrideProps = { ...childProps };
	for (const propName in childProps) {
		const slotPropValue = slotProps[propName];
		const childPropValue = childProps[propName];
		if (/^on[A-Z]/.test(propName)) {
			if (slotPropValue && childPropValue) overrideProps[propName] = (...args) => {
				const result = childPropValue(...args);
				slotPropValue(...args);
				return result;
			};
			else if (slotPropValue) overrideProps[propName] = slotPropValue;
		} else if (propName === "style") overrideProps[propName] = {
			...slotPropValue,
			...childPropValue
		};
		else if (propName === "className") overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
	}
	return {
		...slotProps,
		...overrideProps
	};
}
function getElementRef$1(element) {
	let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
	let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.ref;
	getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
	mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.props.ref;
	return element.props.ref || element.ref;
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-primitive@2_b8bbb21c99db43a0a737ecfcde353894/node_modules/@radix-ui/react-primitive/dist/index.mjs
var Primitive = [
	"a",
	"button",
	"div",
	"form",
	"h2",
	"h3",
	"img",
	"input",
	"label",
	"li",
	"nav",
	"ol",
	"p",
	"select",
	"span",
	"svg",
	"ul"
].reduce((primitive, node) => {
	const Slot = /* @__PURE__ */ createSlot(`Primitive.${node}`);
	const Node = import_react.forwardRef((props, forwardedRef) => {
		const { asChild, ...primitiveProps } = props;
		const Comp = asChild ? Slot : node;
		if (typeof window !== "undefined") window[Symbol.for("radix-ui")] = true;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
			...primitiveProps,
			ref: forwardedRef
		});
	});
	Node.displayName = `Primitive.${node}`;
	return {
		...primitive,
		[node]: Node
	};
}, {});
function dispatchDiscreteCustomEvent(target, event) {
	if (target) import_react_dom.flushSync(() => target.dispatchEvent(event));
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-layout-_e3054a005c42961eaf98f46ee82dfee9/node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var useLayoutEffect2 = globalThis?.document ? import_react.useLayoutEffect : () => {};
import_react[" useEffectEvent ".trim().toString()];
import_react[" useInsertionEffect ".trim().toString()];
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-control_20e929475cffd90492f0a65ad79baab9/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
var useInsertionEffect = import_react[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({ prop, defaultProp, onChange = () => {}, caller }) {
	const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
		defaultProp,
		onChange
	});
	const isControlled = prop !== void 0;
	const value = isControlled ? prop : uncontrolledProp;
	{
		const isControlledRef = import_react.useRef(prop !== void 0);
		import_react.useEffect(() => {
			const wasControlled = isControlledRef.current;
			if (wasControlled !== isControlled) console.warn(`${caller} is changing from ${wasControlled ? "controlled" : "uncontrolled"} to ${isControlled ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`);
			isControlledRef.current = isControlled;
		}, [isControlled, caller]);
	}
	return [value, import_react.useCallback((nextValue) => {
		if (isControlled) {
			const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
			if (value2 !== prop) onChangeRef.current?.(value2);
		} else setUncontrolledProp(nextValue);
	}, [
		isControlled,
		prop,
		setUncontrolledProp,
		onChangeRef
	])];
}
function useUncontrolledState({ defaultProp, onChange }) {
	const [value, setValue] = import_react.useState(defaultProp);
	const prevValueRef = import_react.useRef(value);
	const onChangeRef = import_react.useRef(onChange);
	useInsertionEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);
	import_react.useEffect(() => {
		if (prevValueRef.current !== value) {
			onChangeRef.current?.(value);
			prevValueRef.current = value;
		}
	}, [value, prevValueRef]);
	return [
		value,
		setValue,
		onChangeRef
	];
}
function isFunction(value) {
	return typeof value === "function";
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-direction@1_fbc0d4db32e5a0b33557f5bcd991a4e2/node_modules/@radix-ui/react-direction/dist/index.mjs
var DirectionContext = import_react.createContext(void 0);
function useDirection(localDir) {
	const globalDir = import_react.useContext(DirectionContext);
	return localDir || globalDir || "ltr";
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-presence@1._ed84e7f4276746b2c3b5c094541d596b/node_modules/@radix-ui/react-presence/dist/index.mjs
function useStateMachine(initialState, machine) {
	return import_react.useReducer((state, event) => {
		return machine[state][event] ?? state;
	}, initialState);
}
var Presence = (props) => {
	const { present, children } = props;
	const presence = usePresence(present);
	const child = typeof children === "function" ? children({ present: presence.isPresent }) : import_react.Children.only(children);
	const ref = useComposedRefs(presence.ref, getElementRef(child));
	return typeof children === "function" || presence.isPresent ? import_react.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
	const [node, setNode] = import_react.useState();
	const stylesRef = import_react.useRef(null);
	const prevPresentRef = import_react.useRef(present);
	const prevAnimationNameRef = import_react.useRef("none");
	const [state, send] = useStateMachine(present ? "mounted" : "unmounted", {
		mounted: {
			UNMOUNT: "unmounted",
			ANIMATION_OUT: "unmountSuspended"
		},
		unmountSuspended: {
			MOUNT: "mounted",
			ANIMATION_END: "unmounted"
		},
		unmounted: { MOUNT: "mounted" }
	});
	import_react.useEffect(() => {
		const currentAnimationName = getAnimationName(stylesRef.current);
		prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
	}, [state]);
	useLayoutEffect2(() => {
		const styles = stylesRef.current;
		const wasPresent = prevPresentRef.current;
		if (wasPresent !== present) {
			const prevAnimationName = prevAnimationNameRef.current;
			const currentAnimationName = getAnimationName(styles);
			if (present) send("MOUNT");
			else if (currentAnimationName === "none" || styles?.display === "none") send("UNMOUNT");
			else if (wasPresent && prevAnimationName !== currentAnimationName) send("ANIMATION_OUT");
			else send("UNMOUNT");
			prevPresentRef.current = present;
		}
	}, [present, send]);
	useLayoutEffect2(() => {
		if (node) {
			let timeoutId;
			const ownerWindow = node.ownerDocument.defaultView ?? window;
			const handleAnimationEnd = (event) => {
				const isCurrentAnimation = getAnimationName(stylesRef.current).includes(CSS.escape(event.animationName));
				if (event.target === node && isCurrentAnimation) {
					send("ANIMATION_END");
					if (!prevPresentRef.current) {
						const currentFillMode = node.style.animationFillMode;
						node.style.animationFillMode = "forwards";
						timeoutId = ownerWindow.setTimeout(() => {
							if (node.style.animationFillMode === "forwards") node.style.animationFillMode = currentFillMode;
						});
					}
				}
			};
			const handleAnimationStart = (event) => {
				if (event.target === node) prevAnimationNameRef.current = getAnimationName(stylesRef.current);
			};
			node.addEventListener("animationstart", handleAnimationStart);
			node.addEventListener("animationcancel", handleAnimationEnd);
			node.addEventListener("animationend", handleAnimationEnd);
			return () => {
				ownerWindow.clearTimeout(timeoutId);
				node.removeEventListener("animationstart", handleAnimationStart);
				node.removeEventListener("animationcancel", handleAnimationEnd);
				node.removeEventListener("animationend", handleAnimationEnd);
			};
		} else send("ANIMATION_END");
	}, [node, send]);
	return {
		isPresent: ["mounted", "unmountSuspended"].includes(state),
		ref: import_react.useCallback((node2) => {
			stylesRef.current = node2 ? getComputedStyle(node2) : null;
			setNode(node2);
		}, [])
	};
}
function getAnimationName(styles) {
	return styles?.animationName || "none";
}
function getElementRef(element) {
	let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
	let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.ref;
	getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
	mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.props.ref;
	return element.props.ref || element.ref;
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-id@1.1.1_@types+react@19.2.17_react@19.2.7/node_modules/@radix-ui/react-id/dist/index.mjs
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
//#region node_modules/.pnpm/@radix-ui+react-collection@_a1611ff7082b26c87c56f69af07d70e3/node_modules/@radix-ui/react-collection/dist/index.mjs
function createCollection(name) {
	const PROVIDER_NAME = name + "CollectionProvider";
	const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);
	const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(PROVIDER_NAME, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	});
	const CollectionProvider = (props) => {
		const { scope, children } = props;
		const ref = import_react.useRef(null);
		const itemMap = import_react.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionProviderImpl, {
			scope,
			itemMap,
			collectionRef: ref,
			children
		});
	};
	CollectionProvider.displayName = PROVIDER_NAME;
	const COLLECTION_SLOT_NAME = name + "CollectionSlot";
	const CollectionSlotImpl = /* @__PURE__ */ createSlot(COLLECTION_SLOT_NAME);
	const CollectionSlot = import_react.forwardRef((props, forwardedRef) => {
		const { scope, children } = props;
		const composedRefs = useComposedRefs(forwardedRef, useCollectionContext(COLLECTION_SLOT_NAME, scope).collectionRef);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionSlotImpl, {
			ref: composedRefs,
			children
		});
	});
	CollectionSlot.displayName = COLLECTION_SLOT_NAME;
	const ITEM_SLOT_NAME = name + "CollectionItemSlot";
	const ITEM_DATA_ATTR = "data-radix-collection-item";
	const CollectionItemSlotImpl = /* @__PURE__ */ createSlot(ITEM_SLOT_NAME);
	const CollectionItemSlot = import_react.forwardRef((props, forwardedRef) => {
		const { scope, children, ...itemData } = props;
		const ref = import_react.useRef(null);
		const composedRefs = useComposedRefs(forwardedRef, ref);
		const context = useCollectionContext(ITEM_SLOT_NAME, scope);
		import_react.useEffect(() => {
			context.itemMap.set(ref, {
				ref,
				...itemData
			});
			return () => void context.itemMap.delete(ref);
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionItemSlotImpl, {
			[ITEM_DATA_ATTR]: "",
			ref: composedRefs,
			children
		});
	});
	CollectionItemSlot.displayName = ITEM_SLOT_NAME;
	function useCollection(scope) {
		const context = useCollectionContext(name + "CollectionConsumer", scope);
		return import_react.useCallback(() => {
			const collectionNode = context.collectionRef.current;
			if (!collectionNode) return [];
			const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
			return Array.from(context.itemMap.values()).sort((a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current));
		}, [context.collectionRef, context.itemMap]);
	}
	return [
		{
			Provider: CollectionProvider,
			Slot: CollectionSlot,
			ItemSlot: CollectionItemSlot
		},
		useCollection,
		createCollectionScope
	];
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-previou_095d3ca3921972fec25bd1196a9def7f/node_modules/@radix-ui/react-use-previous/dist/index.mjs
function usePrevious(value) {
	const ref = import_react.useRef({
		value,
		previous: value
	});
	return import_react.useMemo(() => {
		if (ref.current.value !== value) {
			ref.current.previous = ref.current.value;
			ref.current.value = value;
		}
		return ref.current.previous;
	}, [value]);
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-callbac_a013a63ece511f41fddfb088e22655ec/node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function useCallbackRef(callback) {
	const callbackRef = import_react.useRef(callback);
	import_react.useEffect(() => {
		callbackRef.current = callback;
	});
	return import_react.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-visually-hi_070bcfa32421a5876e7dcb93369fcbee/node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var VISUALLY_HIDDEN_STYLES = Object.freeze({
	position: "absolute",
	border: 0,
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal"
});
var NAME = "VisuallyHidden";
var VisuallyHidden = import_react.forwardRef((props, forwardedRef) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		...props,
		ref: forwardedRef,
		style: {
			...VISUALLY_HIDDEN_STYLES,
			...props.style
		}
	});
});
VisuallyHidden.displayName = NAME;
var Root = VisuallyHidden;
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-navigation-_c860552e7849fc5dc1d0ff829acf142e/node_modules/@radix-ui/react-navigation-menu/dist/index.mjs
var NAVIGATION_MENU_NAME = "NavigationMenu";
var [Collection, useCollection, createCollectionScope] = createCollection(NAVIGATION_MENU_NAME);
var [FocusGroupCollection, useFocusGroupCollection, createFocusGroupCollectionScope] = createCollection(NAVIGATION_MENU_NAME);
var [createNavigationMenuContext, createNavigationMenuScope] = createContextScope(NAVIGATION_MENU_NAME, [createCollectionScope, createFocusGroupCollectionScope]);
var [NavigationMenuProviderImpl, useNavigationMenuContext] = createNavigationMenuContext(NAVIGATION_MENU_NAME);
var [ViewportContentProvider, useViewportContentContext] = createNavigationMenuContext(NAVIGATION_MENU_NAME);
var NavigationMenu = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, value: valueProp, onValueChange, defaultValue, delayDuration = 200, skipDelayDuration = 300, orientation = "horizontal", dir, ...NavigationMenuProps } = props;
	const [navigationMenu, setNavigationMenu] = import_react.useState(null);
	const composedRef = useComposedRefs(forwardedRef, (node) => setNavigationMenu(node));
	const direction = useDirection(dir);
	const openTimerRef = import_react.useRef(0);
	const closeTimerRef = import_react.useRef(0);
	const skipDelayTimerRef = import_react.useRef(0);
	const [isOpenDelayed, setIsOpenDelayed] = import_react.useState(true);
	const [value, setValue] = useControllableState({
		prop: valueProp,
		onChange: (value2) => {
			const isOpen = value2 !== "";
			const hasSkipDelayDuration = skipDelayDuration > 0;
			if (isOpen) {
				window.clearTimeout(skipDelayTimerRef.current);
				if (hasSkipDelayDuration) setIsOpenDelayed(false);
			} else {
				window.clearTimeout(skipDelayTimerRef.current);
				skipDelayTimerRef.current = window.setTimeout(() => setIsOpenDelayed(true), skipDelayDuration);
			}
			onValueChange?.(value2);
		},
		defaultProp: defaultValue ?? "",
		caller: NAVIGATION_MENU_NAME
	});
	const startCloseTimer = import_react.useCallback(() => {
		window.clearTimeout(closeTimerRef.current);
		closeTimerRef.current = window.setTimeout(() => setValue(""), 150);
	}, [setValue]);
	const handleOpen = import_react.useCallback((itemValue) => {
		window.clearTimeout(closeTimerRef.current);
		setValue(itemValue);
	}, [setValue]);
	const handleDelayedOpen = import_react.useCallback((itemValue) => {
		if (value === itemValue) window.clearTimeout(closeTimerRef.current);
		else openTimerRef.current = window.setTimeout(() => {
			window.clearTimeout(closeTimerRef.current);
			setValue(itemValue);
		}, delayDuration);
	}, [
		value,
		setValue,
		delayDuration
	]);
	import_react.useEffect(() => {
		return () => {
			window.clearTimeout(openTimerRef.current);
			window.clearTimeout(closeTimerRef.current);
			window.clearTimeout(skipDelayTimerRef.current);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuProvider, {
		scope: __scopeNavigationMenu,
		isRootMenu: true,
		value,
		dir: direction,
		orientation,
		rootNavigationMenu: navigationMenu,
		onTriggerEnter: (itemValue) => {
			window.clearTimeout(openTimerRef.current);
			if (isOpenDelayed) handleDelayedOpen(itemValue);
			else handleOpen(itemValue);
		},
		onTriggerLeave: () => {
			window.clearTimeout(openTimerRef.current);
			startCloseTimer();
		},
		onContentEnter: () => window.clearTimeout(closeTimerRef.current),
		onContentLeave: startCloseTimer,
		onItemSelect: (itemValue) => {
			setValue((prevValue) => prevValue === itemValue ? "" : itemValue);
		},
		onItemDismiss: () => setValue(""),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.nav, {
			"aria-label": "Main",
			"data-orientation": orientation,
			dir: direction,
			...NavigationMenuProps,
			ref: composedRef
		})
	});
});
NavigationMenu.displayName = NAVIGATION_MENU_NAME;
var SUB_NAME = "NavigationMenuSub";
var NavigationMenuSub = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, value: valueProp, onValueChange, defaultValue, orientation = "horizontal", ...subProps } = props;
	const context = useNavigationMenuContext(SUB_NAME, __scopeNavigationMenu);
	const [value, setValue] = useControllableState({
		prop: valueProp,
		onChange: onValueChange,
		defaultProp: defaultValue ?? "",
		caller: SUB_NAME
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuProvider, {
		scope: __scopeNavigationMenu,
		isRootMenu: false,
		value,
		dir: context.dir,
		orientation,
		rootNavigationMenu: context.rootNavigationMenu,
		onTriggerEnter: (itemValue) => setValue(itemValue),
		onItemSelect: (itemValue) => setValue(itemValue),
		onItemDismiss: () => setValue(""),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
			"data-orientation": orientation,
			...subProps,
			ref: forwardedRef
		})
	});
});
NavigationMenuSub.displayName = SUB_NAME;
var NavigationMenuProvider = (props) => {
	const { scope, isRootMenu, rootNavigationMenu, dir, orientation, children, value, onItemSelect, onItemDismiss, onTriggerEnter, onTriggerLeave, onContentEnter, onContentLeave } = props;
	const [viewport, setViewport] = import_react.useState(null);
	const [viewportContent, setViewportContent] = import_react.useState(/* @__PURE__ */ new Map());
	const [indicatorTrack, setIndicatorTrack] = import_react.useState(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuProviderImpl, {
		scope,
		isRootMenu,
		rootNavigationMenu,
		value,
		previousValue: usePrevious(value),
		baseId: useId(),
		dir,
		orientation,
		viewport,
		onViewportChange: setViewport,
		indicatorTrack,
		onIndicatorTrackChange: setIndicatorTrack,
		onTriggerEnter: useCallbackRef(onTriggerEnter),
		onTriggerLeave: useCallbackRef(onTriggerLeave),
		onContentEnter: useCallbackRef(onContentEnter),
		onContentLeave: useCallbackRef(onContentLeave),
		onItemSelect: useCallbackRef(onItemSelect),
		onItemDismiss: useCallbackRef(onItemDismiss),
		onViewportContentChange: import_react.useCallback((contentValue, contentData) => {
			setViewportContent((prevContent) => {
				prevContent.set(contentValue, contentData);
				return new Map(prevContent);
			});
		}, []),
		onViewportContentRemove: import_react.useCallback((contentValue) => {
			setViewportContent((prevContent) => {
				if (!prevContent.has(contentValue)) return prevContent;
				prevContent.delete(contentValue);
				return new Map(prevContent);
			});
		}, []),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.Provider, {
			scope,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportContentProvider, {
				scope,
				items: viewportContent,
				children
			})
		})
	});
};
var LIST_NAME = "NavigationMenuList";
var NavigationMenuList = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, ...listProps } = props;
	const context = useNavigationMenuContext(LIST_NAME, __scopeNavigationMenu);
	const list = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.ul, {
		"data-orientation": context.orientation,
		...listProps,
		ref: forwardedRef
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		style: { position: "relative" },
		ref: context.onIndicatorTrackChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.Slot, {
			scope: __scopeNavigationMenu,
			children: context.isRootMenu ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroup, {
				asChild: true,
				children: list
			}) : list
		})
	});
});
NavigationMenuList.displayName = LIST_NAME;
var ITEM_NAME = "NavigationMenuItem";
var [NavigationMenuItemContextProvider, useNavigationMenuItemContext] = createNavigationMenuContext(ITEM_NAME);
var NavigationMenuItem = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, value: valueProp, ...itemProps } = props;
	const autoValue = useId();
	const value = valueProp || autoValue || "LEGACY_REACT_AUTO_VALUE";
	const contentRef = import_react.useRef(null);
	const triggerRef = import_react.useRef(null);
	const focusProxyRef = import_react.useRef(null);
	const restoreContentTabOrderRef = import_react.useRef(() => {});
	const wasEscapeCloseRef = import_react.useRef(false);
	const handleContentEntry = import_react.useCallback((side = "start") => {
		if (contentRef.current) {
			restoreContentTabOrderRef.current();
			const candidates = getTabbableCandidates(contentRef.current);
			if (candidates.length) focusFirst(side === "start" ? candidates : candidates.reverse());
		}
	}, []);
	const handleContentExit = import_react.useCallback(() => {
		if (contentRef.current) {
			const candidates = getTabbableCandidates(contentRef.current);
			if (candidates.length) restoreContentTabOrderRef.current = removeFromTabOrder(candidates);
		}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuItemContextProvider, {
		scope: __scopeNavigationMenu,
		value,
		triggerRef,
		contentRef,
		focusProxyRef,
		wasEscapeCloseRef,
		onEntryKeyDown: handleContentEntry,
		onFocusProxyEnter: handleContentEntry,
		onRootContentClose: handleContentExit,
		onContentFocusOutside: handleContentExit,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.li, {
			...itemProps,
			ref: forwardedRef
		})
	});
});
NavigationMenuItem.displayName = ITEM_NAME;
var TRIGGER_NAME = "NavigationMenuTrigger";
var NavigationMenuTrigger = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, disabled, ...triggerProps } = props;
	const context = useNavigationMenuContext(TRIGGER_NAME, props.__scopeNavigationMenu);
	const itemContext = useNavigationMenuItemContext(TRIGGER_NAME, props.__scopeNavigationMenu);
	const ref = import_react.useRef(null);
	const composedRefs = useComposedRefs(ref, itemContext.triggerRef, forwardedRef);
	const triggerId = makeTriggerId(context.baseId, itemContext.value);
	const contentId = makeContentId(context.baseId, itemContext.value);
	const hasPointerMoveOpenedRef = import_react.useRef(false);
	const wasClickCloseRef = import_react.useRef(false);
	const open = itemContext.value === context.value;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.ItemSlot, {
		scope: __scopeNavigationMenu,
		value: itemContext.value,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroupItem, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
				id: triggerId,
				disabled,
				"data-disabled": disabled ? "" : void 0,
				"data-state": getOpenState(open),
				"aria-expanded": open,
				"aria-controls": contentId,
				...triggerProps,
				ref: composedRefs,
				onPointerEnter: composeEventHandlers(props.onPointerEnter, () => {
					wasClickCloseRef.current = false;
					itemContext.wasEscapeCloseRef.current = false;
				}),
				onPointerMove: composeEventHandlers(props.onPointerMove, whenMouse(() => {
					if (disabled || wasClickCloseRef.current || itemContext.wasEscapeCloseRef.current || hasPointerMoveOpenedRef.current) return;
					context.onTriggerEnter(itemContext.value);
					hasPointerMoveOpenedRef.current = true;
				})),
				onPointerLeave: composeEventHandlers(props.onPointerLeave, whenMouse(() => {
					if (disabled) return;
					context.onTriggerLeave();
					hasPointerMoveOpenedRef.current = false;
				})),
				onClick: composeEventHandlers(props.onClick, () => {
					context.onItemSelect(itemContext.value);
					wasClickCloseRef.current = open;
				}),
				onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
					const entryKey = {
						horizontal: "ArrowDown",
						vertical: context.dir === "rtl" ? "ArrowLeft" : "ArrowRight"
					}[context.orientation];
					if (open && event.key === entryKey) {
						itemContext.onEntryKeyDown();
						event.preventDefault();
					}
				})
			})
		})
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"aria-hidden": true,
		tabIndex: 0,
		ref: itemContext.focusProxyRef,
		onFocus: (event) => {
			const content = itemContext.contentRef.current;
			const prevFocusedElement = event.relatedTarget;
			const wasTriggerFocused = prevFocusedElement === ref.current;
			const wasFocusFromContent = content?.contains(prevFocusedElement);
			if (wasTriggerFocused || !wasFocusFromContent) itemContext.onFocusProxyEnter(wasTriggerFocused ? "start" : "end");
		}
	}), context.viewport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-owns": contentId })] })] });
});
NavigationMenuTrigger.displayName = TRIGGER_NAME;
var LINK_NAME = "NavigationMenuLink";
var LINK_SELECT = "navigationMenu.linkSelect";
var NavigationMenuLink = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, active, onSelect, ...linkProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroupItem, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.a, {
			"data-active": active ? "" : void 0,
			"aria-current": active ? "page" : void 0,
			...linkProps,
			ref: forwardedRef,
			onClick: composeEventHandlers(props.onClick, (event) => {
				const target = event.target;
				const linkSelectEvent = new CustomEvent(LINK_SELECT, {
					bubbles: true,
					cancelable: true
				});
				target.addEventListener(LINK_SELECT, (event2) => onSelect?.(event2), { once: true });
				dispatchDiscreteCustomEvent(target, linkSelectEvent);
				if (!linkSelectEvent.defaultPrevented && !event.metaKey) dispatchDiscreteCustomEvent(target, new CustomEvent(ROOT_CONTENT_DISMISS, {
					bubbles: true,
					cancelable: true
				}));
			}, { checkForDefaultPrevented: false })
		})
	});
});
NavigationMenuLink.displayName = LINK_NAME;
var INDICATOR_NAME = "NavigationMenuIndicator";
var NavigationMenuIndicator = import_react.forwardRef((props, forwardedRef) => {
	const { forceMount, ...indicatorProps } = props;
	const context = useNavigationMenuContext(INDICATOR_NAME, props.__scopeNavigationMenu);
	const isVisible = Boolean(context.value);
	return context.indicatorTrack ? import_react_dom.createPortal(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || isVisible,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuIndicatorImpl, {
			...indicatorProps,
			ref: forwardedRef
		})
	}), context.indicatorTrack) : null;
});
NavigationMenuIndicator.displayName = INDICATOR_NAME;
var NavigationMenuIndicatorImpl = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, ...indicatorProps } = props;
	const context = useNavigationMenuContext(INDICATOR_NAME, __scopeNavigationMenu);
	const getItems = useCollection(__scopeNavigationMenu);
	const [activeTrigger, setActiveTrigger] = import_react.useState(null);
	const [position, setPosition] = import_react.useState(null);
	const isHorizontal = context.orientation === "horizontal";
	const isVisible = Boolean(context.value);
	import_react.useEffect(() => {
		const triggerNode = getItems().find((item) => item.value === context.value)?.ref.current;
		if (triggerNode) setActiveTrigger(triggerNode);
	}, [getItems, context.value]);
	const handlePositionChange = () => {
		if (activeTrigger) setPosition({
			size: isHorizontal ? activeTrigger.offsetWidth : activeTrigger.offsetHeight,
			offset: isHorizontal ? activeTrigger.offsetLeft : activeTrigger.offsetTop
		});
	};
	useResizeObserver(activeTrigger, handlePositionChange);
	useResizeObserver(context.indicatorTrack, handlePositionChange);
	return position ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		"aria-hidden": true,
		"data-state": isVisible ? "visible" : "hidden",
		"data-orientation": context.orientation,
		...indicatorProps,
		ref: forwardedRef,
		style: {
			position: "absolute",
			...isHorizontal ? {
				left: 0,
				width: position.size + "px",
				transform: `translateX(${position.offset}px)`
			} : {
				top: 0,
				height: position.size + "px",
				transform: `translateY(${position.offset}px)`
			},
			...indicatorProps.style
		}
	}) : null;
});
var CONTENT_NAME = "NavigationMenuContent";
var NavigationMenuContent = import_react.forwardRef((props, forwardedRef) => {
	const { forceMount, ...contentProps } = props;
	const context = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu);
	const itemContext = useNavigationMenuItemContext(CONTENT_NAME, props.__scopeNavigationMenu);
	const composedRefs = useComposedRefs(itemContext.contentRef, forwardedRef);
	const open = itemContext.value === context.value;
	const commonProps = {
		value: itemContext.value,
		triggerRef: itemContext.triggerRef,
		focusProxyRef: itemContext.focusProxyRef,
		wasEscapeCloseRef: itemContext.wasEscapeCloseRef,
		onContentFocusOutside: itemContext.onContentFocusOutside,
		onRootContentClose: itemContext.onRootContentClose,
		...contentProps
	};
	return !context.viewport ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || open,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuContentImpl, {
			"data-state": getOpenState(open),
			...commonProps,
			ref: composedRefs,
			onPointerEnter: composeEventHandlers(props.onPointerEnter, context.onContentEnter),
			onPointerLeave: composeEventHandlers(props.onPointerLeave, whenMouse(context.onContentLeave)),
			style: {
				pointerEvents: !open && context.isRootMenu ? "none" : void 0,
				...commonProps.style
			}
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportContentMounter, {
		forceMount,
		...commonProps,
		ref: composedRefs
	});
});
NavigationMenuContent.displayName = CONTENT_NAME;
var ViewportContentMounter = import_react.forwardRef((props, forwardedRef) => {
	const { onViewportContentChange, onViewportContentRemove } = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu);
	useLayoutEffect2(() => {
		onViewportContentChange(props.value, {
			ref: forwardedRef,
			...props
		});
	}, [
		props,
		forwardedRef,
		onViewportContentChange
	]);
	useLayoutEffect2(() => {
		return () => onViewportContentRemove(props.value);
	}, [props.value, onViewportContentRemove]);
	return null;
});
var ROOT_CONTENT_DISMISS = "navigationMenu.rootContentDismiss";
var NavigationMenuContentImpl = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, value, triggerRef, focusProxyRef, wasEscapeCloseRef, onRootContentClose, onContentFocusOutside, ...contentProps } = props;
	const context = useNavigationMenuContext(CONTENT_NAME, __scopeNavigationMenu);
	const ref = import_react.useRef(null);
	const composedRefs = useComposedRefs(ref, forwardedRef);
	const triggerId = makeTriggerId(context.baseId, value);
	const contentId = makeContentId(context.baseId, value);
	const getItems = useCollection(__scopeNavigationMenu);
	const prevMotionAttributeRef = import_react.useRef(null);
	const { onItemDismiss } = context;
	import_react.useEffect(() => {
		const content = ref.current;
		if (context.isRootMenu && content) {
			const handleClose = () => {
				onItemDismiss();
				onRootContentClose();
				if (content.contains(document.activeElement)) triggerRef.current?.focus();
			};
			content.addEventListener(ROOT_CONTENT_DISMISS, handleClose);
			return () => content.removeEventListener(ROOT_CONTENT_DISMISS, handleClose);
		}
	}, [
		context.isRootMenu,
		props.value,
		triggerRef,
		onItemDismiss,
		onRootContentClose
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroup, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DismissableLayer, {
			id: contentId,
			"aria-labelledby": triggerId,
			"data-motion": import_react.useMemo(() => {
				const values = getItems().map((item) => item.value);
				if (context.dir === "rtl") values.reverse();
				const index = values.indexOf(context.value);
				const prevIndex = values.indexOf(context.previousValue);
				const isSelected = value === context.value;
				const wasSelected = prevIndex === values.indexOf(value);
				if (!isSelected && !wasSelected) return prevMotionAttributeRef.current;
				const attribute = (() => {
					if (index !== prevIndex) {
						if (isSelected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start";
						if (wasSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end";
					}
					return null;
				})();
				prevMotionAttributeRef.current = attribute;
				return attribute;
			}, [
				context.previousValue,
				context.value,
				context.dir,
				getItems,
				value
			]),
			"data-orientation": context.orientation,
			...contentProps,
			ref: composedRefs,
			disableOutsidePointerEvents: false,
			onDismiss: () => {
				const rootContentDismissEvent = new Event(ROOT_CONTENT_DISMISS, {
					bubbles: true,
					cancelable: true
				});
				ref.current?.dispatchEvent(rootContentDismissEvent);
			},
			onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => {
				onContentFocusOutside();
				const target = event.target;
				if (context.rootNavigationMenu?.contains(target)) event.preventDefault();
			}),
			onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
				const target = event.target;
				const isTrigger = getItems().some((item) => item.ref.current?.contains(target));
				const isRootViewport = context.isRootMenu && context.viewport?.contains(target);
				if (isTrigger || isRootViewport || !context.isRootMenu) event.preventDefault();
			}),
			onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
				const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
				if (event.key === "Tab" && !isMetaKey) {
					const candidates = getTabbableCandidates(event.currentTarget);
					const focusedElement = document.activeElement;
					const index = candidates.findIndex((candidate) => candidate === focusedElement);
					if (focusFirst(event.shiftKey ? candidates.slice(0, index).reverse() : candidates.slice(index + 1, candidates.length))) event.preventDefault();
					else focusProxyRef.current?.focus();
				}
			}),
			onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, (_event) => {
				wasEscapeCloseRef.current = true;
			})
		})
	});
});
var VIEWPORT_NAME = "NavigationMenuViewport";
var NavigationMenuViewport = import_react.forwardRef((props, forwardedRef) => {
	const { forceMount, ...viewportProps } = props;
	const context = useNavigationMenuContext(VIEWPORT_NAME, props.__scopeNavigationMenu);
	const open = Boolean(context.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || open,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuViewportImpl, {
			...viewportProps,
			ref: forwardedRef
		})
	});
});
NavigationMenuViewport.displayName = VIEWPORT_NAME;
var NavigationMenuViewportImpl = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, children, ...viewportImplProps } = props;
	const context = useNavigationMenuContext(VIEWPORT_NAME, __scopeNavigationMenu);
	const composedRefs = useComposedRefs(forwardedRef, context.onViewportChange);
	const viewportContentContext = useViewportContentContext(CONTENT_NAME, props.__scopeNavigationMenu);
	const [size, setSize] = import_react.useState(null);
	const [content, setContent] = import_react.useState(null);
	const viewportWidth = size ? size?.width + "px" : void 0;
	const viewportHeight = size ? size?.height + "px" : void 0;
	const open = Boolean(context.value);
	const activeContentValue = open ? context.value : context.previousValue;
	const handleSizeChange = () => {
		if (content) setSize({
			width: content.offsetWidth,
			height: content.offsetHeight
		});
	};
	useResizeObserver(content, handleSizeChange);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		"data-state": getOpenState(open),
		"data-orientation": context.orientation,
		...viewportImplProps,
		ref: composedRefs,
		style: {
			pointerEvents: !open && context.isRootMenu ? "none" : void 0,
			["--radix-navigation-menu-viewport-width"]: viewportWidth,
			["--radix-navigation-menu-viewport-height"]: viewportHeight,
			...viewportImplProps.style
		},
		onPointerEnter: composeEventHandlers(props.onPointerEnter, context.onContentEnter),
		onPointerLeave: composeEventHandlers(props.onPointerLeave, whenMouse(context.onContentLeave)),
		children: Array.from(viewportContentContext.items).map(([value, { ref, forceMount, ...props2 }]) => {
			const isActive = activeContentValue === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
				present: forceMount || isActive,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuContentImpl, {
					...props2,
					ref: composeRefs(ref, (node) => {
						if (isActive && node) setContent(node);
					})
				})
			}, value);
		})
	});
});
var FOCUS_GROUP_NAME = "FocusGroup";
var FocusGroup = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, ...groupProps } = props;
	const context = useNavigationMenuContext(FOCUS_GROUP_NAME, __scopeNavigationMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroupCollection.Provider, {
		scope: __scopeNavigationMenu,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroupCollection.Slot, {
			scope: __scopeNavigationMenu,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
				dir: context.dir,
				...groupProps,
				ref: forwardedRef
			})
		})
	});
});
var ARROW_KEYS = [
	"ArrowRight",
	"ArrowLeft",
	"ArrowUp",
	"ArrowDown"
];
var FOCUS_GROUP_ITEM_NAME = "FocusGroupItem";
var FocusGroupItem = import_react.forwardRef((props, forwardedRef) => {
	const { __scopeNavigationMenu, ...groupProps } = props;
	const getItems = useFocusGroupCollection(__scopeNavigationMenu);
	const context = useNavigationMenuContext(FOCUS_GROUP_ITEM_NAME, __scopeNavigationMenu);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGroupCollection.ItemSlot, {
		scope: __scopeNavigationMenu,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
			...groupProps,
			ref: forwardedRef,
			onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
				if ([
					"Home",
					"End",
					...ARROW_KEYS
				].includes(event.key)) {
					let candidateNodes = getItems().map((item) => item.ref.current);
					if ([
						context.dir === "rtl" ? "ArrowRight" : "ArrowLeft",
						"ArrowUp",
						"End"
					].includes(event.key)) candidateNodes.reverse();
					if (ARROW_KEYS.includes(event.key)) {
						const currentIndex = candidateNodes.indexOf(event.currentTarget);
						candidateNodes = candidateNodes.slice(currentIndex + 1);
					}
					setTimeout(() => focusFirst(candidateNodes));
					event.preventDefault();
				}
			})
		})
	});
});
function getTabbableCandidates(container) {
	const nodes = [];
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, { acceptNode: (node) => {
		const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
		if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
		return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	while (walker.nextNode()) nodes.push(walker.currentNode);
	return nodes;
}
function focusFirst(candidates) {
	const previouslyFocusedElement = document.activeElement;
	return candidates.some((candidate) => {
		if (candidate === previouslyFocusedElement) return true;
		candidate.focus();
		return document.activeElement !== previouslyFocusedElement;
	});
}
function removeFromTabOrder(candidates) {
	candidates.forEach((candidate) => {
		candidate.dataset.tabindex = candidate.getAttribute("tabindex") || "";
		candidate.setAttribute("tabindex", "-1");
	});
	return () => {
		candidates.forEach((candidate) => {
			const prevTabIndex = candidate.dataset.tabindex;
			candidate.setAttribute("tabindex", prevTabIndex);
		});
	};
}
function useResizeObserver(element, onResize) {
	const handleResize = useCallbackRef(onResize);
	useLayoutEffect2(() => {
		let rAF = 0;
		if (element) {
			const resizeObserver = new ResizeObserver(() => {
				cancelAnimationFrame(rAF);
				rAF = window.requestAnimationFrame(handleResize);
			});
			resizeObserver.observe(element);
			return () => {
				window.cancelAnimationFrame(rAF);
				resizeObserver.unobserve(element);
			};
		}
	}, [element, handleResize]);
}
function getOpenState(open) {
	return open ? "open" : "closed";
}
function makeTriggerId(baseId, value) {
	return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
	return `${baseId}-content-${value}`;
}
function whenMouse(handler) {
	return (event) => event.pointerType === "mouse" ? handler(event) : void 0;
}
var Root2 = NavigationMenu;
var Sub = NavigationMenuSub;
var List = NavigationMenuList;
var Item = NavigationMenuItem;
var Trigger = NavigationMenuTrigger;
var Link = NavigationMenuLink;
var Indicator = NavigationMenuIndicator;
var Content = NavigationMenuContent;
var Viewport = NavigationMenuViewport;
//#endregion
export { Content, Indicator, Item, Link, List, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuSub, NavigationMenuTrigger, NavigationMenuViewport, Root2 as Root, Sub, Trigger, Viewport, createNavigationMenuScope };
