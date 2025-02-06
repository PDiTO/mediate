import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "../helpers/nillionOrgConfig.js";
import { schemas } from "../schemas/schemas.js";

export async function deleteNillionRecordWithSchema(schemaName, id) {
  console.log("🔑 Deleting record with schema:", schemaName, "and id:", id);

  if (!id) {
    throw new Error("ID must be provided for delete operation");
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

    await collection.deleteDataFromNodes(filter);

    return true;
  } catch (error) {
    console.error("❌ SecretVaultWrapper error:", error.message);
    throw error;
  }
}
