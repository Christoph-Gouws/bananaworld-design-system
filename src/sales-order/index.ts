// Shared sales-order contract — barrel. The single "published language" for the order payload that
// crosses the Bananaworld apps. Import via the dedicated subpath so the pure logic never pulls in the
// UI/React layer:
//
//     import { validateSalesOrder, type SalesOrderInput } from "@bananaworld/design-system/sales-order";
//
// DC is the SOLE writer of the operational order; the CRM builds a matching handoff payload. Sharing the
// definition (not the writer) keeps one source of truth for "what a valid order looks like".
export { type SalesOrderInput, type SalesOrderLineInput } from "./types";
export { validateSalesOrder, type ValidationIssue } from "./validation";
