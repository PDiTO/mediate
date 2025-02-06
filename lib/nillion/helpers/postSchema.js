import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "./nillionOrgConfig.js";
import { schemas } from "../schemas/schemas.js";

export async function postSchema(schemaName) {
  try {
    const org = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials
    );
    await org.init();

    const schema = schemas[schemaName];

    const newSchema = await org.createSchema(schema.schema, schema.name);
    console.log("✅ New Collection Schema created for all nodes:", newSchema);
    console.log("👀 Schema ID:", newSchema[0].result.data);
  } catch (error) {
    console.error("❌ Failed to use SecretVaultWrapper:", error.message);
    process.exit(1);
  }
}
