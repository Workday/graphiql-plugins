import { gql } from 'graphql-tag';
import { buildASTSchema } from 'graphql';

export default buildASTSchema(gql`
  scalar FileAttachment

  type Query {
    workers(limit: Int, offset: Int): WorkerCollection!
  }

  type WorkerCollection {
    data: [Worker!]!
    total: Int!
  }

  type Worker {
    id: ID!
    name: String!
    photo: File
    manager: Worker
  }

  type File {
    filename: String!
    filesize: Int!
    contentType: String!
  }

  type Mutation {
    uploadPhoto(worker: ID!, photo: FileAttachment!): File!
  }
`);
