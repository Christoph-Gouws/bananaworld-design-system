// Shared pricing engine — barrel. THE single shared price calculation for both Bananaworld apps
// (CRM ADR-007). Import via the dedicated subpath so the pure logic never pulls in the UI/React layer:
//
//     import { resolvePrice, type CustomerPriceLine } from "@bananaworld/design-system/pricing";
//
export { resolvePrice, selectTier } from "./compute";
export {
  isPriceUom,
  PRICE_UOMS,
  type CustomerPriceLine,
  type PriceResolution,
  type PriceTier,
  type PriceUom,
} from "./types";
