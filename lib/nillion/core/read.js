import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "../helpers/nillionOrgConfig.js";
import { schemas } from "../schemas/schemas.js";

export async function readNillionRecordsWithSchema(schemaName, filter = {}) {
  try {
    const selectedSchema = schemas[schemaName];
    if (!selectedSchema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    // Create a secret vault wrapper and initialize the SecretVault collection to use
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      selectedSchema.schemaId
    );
    await collection.init();

    // Read collection data from nodes with optional filter, decrypting the specified fields
    const decryptedCollectionData = await collection.readFromNodes(filter);

    return decryptedCollectionData;
  } catch (error) {
    console.error("❌ SecretVaultWrapper error:", error.message);
    throw error;
  }
}
