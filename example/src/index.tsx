// /* eslint-disable @typescript-eslint/ban-ts-comment */
//
import { GraphiQL } from 'graphiql';
import { FetcherParams } from '@graphiql/toolkit';
import { createRoot } from 'react-dom/client';
import { execute } from 'graphql/execution';
import { parse } from 'graphql/language';
import { EXECUTABLE_TEST_SCHEMA } from 'test-utils';
import { useContext, useMemo } from 'react';
import {
  MULTIPART_ATTACHMENTS_GRAPHIQL_PLUGIN,
  MultipartAttachmentsContext,
  MultipartAttachmentsProvider,
} from '@workday/graphiql-plugin-multipart-requests';

require('graphiql/graphiql.css');

let firstFetch = true;

function GraphiQLWrapper() {
  const attachments = useContext(MultipartAttachmentsContext);

  const fetcher = useMemo(() => {
    return attachments.decoratedFetcher(
      async ({ query, operationName, variables }: FetcherParams, formData: FormData) => {
        if (operationName === 'IntrospectionQuery') {
          if (!firstFetch) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
          firstFetch = false;
        }

        return execute({
          schema: EXECUTABLE_TEST_SCHEMA,
          document: parse(query),
          variableValues: variables,
          contextValue: { formData },
        });
      }
    );
  }, [attachments]);

  return (
    <GraphiQL
      fetcher={fetcher}
      defaultEditorToolsVisibility='variables'
      plugins={[MULTIPART_ATTACHMENTS_GRAPHIQL_PLUGIN]}
      visiblePlugin={MULTIPART_ATTACHMENTS_GRAPHIQL_PLUGIN}
    />
  );
}

const App = () => (
  <MultipartAttachmentsProvider>
    <GraphiQLWrapper />
  </MultipartAttachmentsProvider>
);

createRoot(document.getElementById('root')).render(<App />);
