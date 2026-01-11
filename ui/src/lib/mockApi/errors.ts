// src/lib/mockApi/errors.ts
// Custom error types for the mock API layer

/**
 * Thrown when a requested resource is not found.
 */
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

// Re-export ContractError from contracts
export { ContractError } from "@/contracts";
