import type { VaultEntry } from "types";

export const keysDbName = "anoma-pay-vault";
export const keysDbVersion = 1;

/**
 * Opens database connection to execute operations. Wraps
 * indexedDB.open with a Promise, resolving if it succeeds. This
 * allows the use of async/await.
 *
 * It also proceeds with the creation of a new database if it doesn't exist.
 * The database version is controlled by {@link keysDbVersion}.
 */
export const openVaultDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(keysDbName, keysDbVersion);

    request.onupgradeneeded = () => {
      const db = request.result;

      const store = db.createObjectStore("vault", {
        keyPath: "id",
      });

      store.createIndex("vault-id", "id", {
        unique: true,
      });

      store.transaction.oncomplete = () => {
        resolve(db);
      };

      store.transaction.onerror = () => {
        reject(store.transaction.error);
      };
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Adds a VaultEntry to the object store.
 *
 * @param vaultEntry - {@link VaultEntry} to be stored
 * @returns Promise resolving to the stored entry after it's insterted successfully
 */
export const insertVaultEntry = async (
  vaultEntry: VaultEntry
): Promise<VaultEntry | undefined> => {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const vault = db.transaction("vault", "readwrite").objectStore("vault");
    const query = vault.add(vaultEntry);

    query.onsuccess = async () => {
      const id = query.result as string;
      try {
        const vault = await retrieveVaultById(id);
        resolve(vault);
      } catch (err) {
        reject(err);
      }
    };

    query.onerror = () => {
      reject(query.error);
    };
  });
};

/**
 * Retrieves a VaultEntry by its id.
 *
 * @param id - Identifier of the vault entry to fetch. Can be a wallet address, a uuid, etc.
 * @returns Promise resolving to the stored {@link VaultEntry} or undefined if it doesn't exists.
 */
export const retrieveVaultById = async (
  id: string
): Promise<VaultEntry | undefined> => {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const vault = db.transaction(["vault"]).objectStore("vault");
    const request = vault.get(id);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};
