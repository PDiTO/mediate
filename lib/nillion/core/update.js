import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "../helpers/nillionOrgConfig.js";
import { schemas } from "../schemas/schemas.js";

export async function updateNillionRecordWithSchema(
  schemaName,
  id,
  updatedRecord
) {
  if (!id) {
    throw new Error("ID must be provided for update operation");
  }

  try {
    const selectedSchema = schemas[schemaName];
    if (!selectedSchema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    const filter = {
      _id: id,
    };

    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      selectedSchema.schemaId
    );
    await collection.init();

    await collection.updateDataToNodes(updatedRecord, filter);

    return true;
  } catch (error) {
    console.error("❌ SecretVaultWrapper error:", error.message);
    throw error;
  }
}
