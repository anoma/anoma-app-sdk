export class InsufficientResourcesError extends Error {
  constructor(required: bigint, available: bigint) {
    super(
      `Insufficient resources: required ${required}, available ${available}`
    );
  }
}
