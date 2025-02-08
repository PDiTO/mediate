import mediationSchema from "./mediationSchema.json" assert { type: "json" };
import partySchema from "./partySchema.json" assert { type: "json" };

export const schemas = {
  mediationSchema: {
    name: "Mediation Schema",
    schema: mediationSchema,
    schemaId: "f424dcc8-0761-45e6-a915-1fbf5812a52d",
  },
  partySchema: {
    name: "Party Schema",
    schema: partySchema,
    schemaId: "43be041d-207c-4b61-857a-73004819d6ab",
  },
};

// export const schemas = {
//   mediationSchema: {
//     name: "Mediation Schema",
//     schema: mediationSchema,
//     schemaId: "76dfc3d7-d4f8-459a-9553-49d78039ebe4",
//   },
//   partySchema: {
//     name: "Party Schema",
//     schema: partySchema,
//     schemaId: "c94cf663-31c8-4955-b520-e5a2e62be42b",
//   },
// };
