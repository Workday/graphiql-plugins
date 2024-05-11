import { Fetcher, FetcherOpts, FetcherParams, FetcherReturnType } from '@graphiql/toolkit';

const OPERATIONS_KEY = 'operations';
const MAP_KEY = 'map';

export type AttachmentEntry = {
  name: string;
  value: File;
};

export type MultipartFetcher = (
  graphQLParams: FetcherParams,
  multipartFormData: FormData | null,
  opts?: FetcherOpts
) => FetcherReturnType;

export class MultipartAttachments {
  private _attachments: AttachmentEntry[];

  constructor(attachments: AttachmentEntry[]) {
    this._attachments = attachments;
  }

  /**
   * Returns an implementation of fetch that will transform the request to a multipart request if any files are found
   */
  public decoratedFetch(fetchOverride: typeof fetch = fetch): typeof fetch {
    if (this._attachments.length > 0) {
      return async (input: RequestInfo | URL, init?: RequestInit) => {
        const originalRequest = new Request(input, init);
        // we're going to overwrite the body but firefox complains if we don't clone it
        const originalBody = await originalRequest.clone().text();

        if (JSON.parse(originalBody)?.operationName !== 'IntrospectionQuery') {
          const body = this.asFormData(originalBody);
          const headers = new Headers(originalRequest.headers);

          // make sure form data sets the correct content type
          headers.delete('content-type');

          return await fetchOverride(originalRequest, { body, headers });
        } else {
          // just pass through for an introspection query
          return fetchOverride(originalRequest);
        }
      };
    } else {
      return fetchOverride;
    }
  }

  /**
   * Constructs a GraphiQL Fetcher that provides FormData to the passed in MultipartFetcher
   */
  public decoratedFetcher(fetcher: MultipartFetcher): Fetcher {
    return (graphQLParams: FetcherParams, opts?: FetcherOpts) => {
      return fetcher(graphQLParams, this.asFormData(graphQLParams), opts);
    };
  }

  get attachments(): Map<string, File> {
    return new Map(this._attachments.map(({ name, value }) => [name, value]));
  }

  private asFormData(operations: FetcherParams | string): FormData | null {
    const attachments = this.attachments;

    // verify our attachments
    for (const invalidKey of [OPERATIONS_KEY, MAP_KEY]) {
      if (attachments.has(invalidKey)) {
        console.error(`Cannot have an attachment named "${invalidKey}"`);

        return null;
      }
    }

    if (attachments.size > 0) {
      const formData = new FormData();

      const encodedOperations = typeof operations === 'string' ? operations : JSON.stringify(operations);
      formData.set(OPERATIONS_KEY, encodedOperations);

      attachments.forEach((value, key) => {
        formData.append(key, value);
      });

      return formData;
    } else {
      return null;
    }
  }
}
