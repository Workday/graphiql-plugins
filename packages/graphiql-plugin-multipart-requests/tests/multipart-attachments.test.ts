/** @jest-environment jsdom */

import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

import { MultipartAttachments } from '../src/multipart-attachments.js';

describe('MultipartAttachments', () => {
  test('returns a Map of attachments', () => {
    const fileA = new File([], 'A');
    const fileB = new File([], 'B');
    expect(new MultipartAttachments([]).attachments).toEqual(new Map());
    expect(
      new MultipartAttachments([
        { name: 'foo', value: fileA },
        { name: 'bar', value: fileB },
      ]).attachments
    ).toEqual(
      new Map([
        ['foo', fileA],
        ['bar', fileB],
      ])
    );
  });

  test('decorates fetch', async () => {
    const fetch = jest.fn();
    expect(new MultipartAttachments([]).decoratedFetch(fetch)).toEqual(fetch);

    await new MultipartAttachments([{ name: 'a', value: new File([], 'A') }]).decoratedFetch(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const originalRequest = new Request(input, init);
        // direct pass through for introspection, check by parsing the body as json
        expect(JSON.parse(await originalRequest.text()));
        return new Response();
      }
    )(
      new Request('http://graphql', {
        method: 'POST',
        body: JSON.stringify({
          operationName: 'IntrospectionQuery',
        }),
      })
    );

    // check that files are attached
    const file = new File(['text'], 'x.txt', { type: 'text/plain' });
    await new MultipartAttachments([{ name: 'a', value: file }]).decoratedFetch(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = init.headers as Headers;
        const body = init.body as FormData;
        expect(headers.get('content-type')).toBeNull();

        expect([...body.entries()].length).toEqual(2);
        expect(body.get('operations')).toEqual('{}');
        expect(body.get('a')).toEqual(file);

        return new Response();
      }
    )(
      new Request('http://graphql', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      })
    );
  });

  test('decorates a Fetcher', async () => {
    new MultipartAttachments([]).decoratedFetcher((params, formData) => {
      expect(formData).toBeNull();
      return '';
    })({ query: '' });

    const file = new File(['text'], 'x.txt', { type: 'text/plain' });
    await new MultipartAttachments([{ name: 'a', value: file }]).decoratedFetcher((params, formData) => {
      expect([...formData.entries()].length).toEqual(2);
      expect(formData.get('operations')).toEqual('{"query":"{}"}');
      expect(formData.get('a')).toEqual(file);
      return '';
    })({ query: '{}' });
  });
});
