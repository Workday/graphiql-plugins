import { addMocksToSchema } from "@graphql-tools/mock";
import { default as TEST_SCHEMA } from "./test-schema.js";

export { TEST_SCHEMA };

export type TestContext = {
  formData: FormData | null;
};

export const EXECUTABLE_TEST_SCHEMA = addMocksToSchema({
  schema: TEST_SCHEMA,
  resolvers: () => ({
    Mutation: {
      uploadPhoto: (_, { photo }, { formData }: TestContext) => {
        const formEntry = formData?.get(photo);
        if (formEntry !== null && formEntry instanceof File) {
          return {
            filename: formEntry.name,
            filesize: formEntry.size,
            contentType: formEntry.type,
          };
        } else {
          throw `No Attachment for '${photo}'`;
        }
      },
    },
  }),
});
