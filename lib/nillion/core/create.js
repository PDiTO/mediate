import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "../helpers/nillionOrgConfig.js";
import { schemas } from "../schemas/schemas.js";

export async function createNillionRecordWithSchema(schemaName, data) {
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

    console.log(data);

    // Write collection data to nodes encrypting the specified fields ahead of time
    const dataWritten = await collection.writeToNodes([data]);

    // Get the ids of the SecretVault records created
    const newIds = [
      ...new Set(dataWritten.map((item) => item.result.data.created).flat()),
    ];
    return newIds;
  } catch (error) {
    console.error("❌ SecretVaultWrapper error:", error.message);
    throw error;
  }
}
