import type {
  CreateBurnProps,
  CreatedResources,
  CreateMintProps,
  CreateTransferProps,
  MintResources,
} from "types";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";

export interface TransferClient {
  migrateResource?(resource: EncodedResource, paAddress: Address): void;
  createMintResources<T = CreateMintProps, U = MintResources>(props: T): U;
  createTransferResource<T = CreateTransferProps, U = CreatedResources>(
    props: T
  ): U;
  createBurnResource<T = CreateBurnProps, U = CreatedResources>(props: T): U;
}
