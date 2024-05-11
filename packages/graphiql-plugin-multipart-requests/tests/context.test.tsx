/** @jest-environment jsdom */

import {
  DUPLICATE_NAME_ERROR,
  InternalAttachmentState,
  MultipartAttachmentsInternalContext,
  NO_FILE_ERROR,
} from '../src/context.js';
import { render } from '@testing-library/react';
import { useContext } from 'react';

describe('InternalAttachmentState', () => {
  test('filters out invalid attachments', () => {
    const state = new InternalAttachmentState([
      { id: 0, name: 'a', value: new File([], 'A') },
      { id: 1, name: 'b', value: new File([], 'B'), error: 'Some Error' },
      { id: 2, name: 'c', value: null, error: 'Some Error' },
    ]);
    expect(state.validAttachments).toHaveLength(1);
  });

  test('handles add action', () => {
    let state = new InternalAttachmentState([]);
    state = state.reduce({ action: 'add' });
    state = state.reduce({ action: 'add', name: 'b' });
    expect(state.attachments).toEqual([
      { id: 0, name: 'part0', value: null, error: NO_FILE_ERROR },
      { id: 1, name: 'b', value: null, error: NO_FILE_ERROR },
    ]);
    expect(state.validAttachments).toHaveLength(0);
  });

  test('handles update action', () => {
    const file = new File([], 'A');
    let state = new InternalAttachmentState([{ id: 0, name: 'a', value: null, error: NO_FILE_ERROR }], 1);
    state = state.reduce({ action: 'update', id: 0, name: 'A' });
    expect(state.attachments).toEqual([{ id: 0, name: 'A', value: null, error: NO_FILE_ERROR }]);
    state = state.reduce({ action: 'update', id: 0, value: file });
    expect(state.attachments).toEqual([{ id: 0, name: 'A', value: file }]);
    // make sure our internal id doesn't update on each new instance
    expect(state.reduce({ action: 'add', name: 'b' }).attachments.filter((a) => a.name == 'b')[0].id).toEqual(1);
  });

  test('handles delete action', () => {
    let state = new InternalAttachmentState([{ id: 0, name: 'a', value: null, error: NO_FILE_ERROR }]);
    expect(state.attachments).toHaveLength(1);
    state = state.reduce({ action: 'delete', id: 0 });
    expect(state.attachments).toHaveLength(0);
  });

  test('updates errors on action', () => {
    const file = new File([], 'A');
    let state = new InternalAttachmentState([{ id: 0, name: 'a', value: null, error: NO_FILE_ERROR }], 1);
    state = state.reduce({ action: 'add', name: 'a' });
    expect(state.attachments).toEqual([
      { id: 0, name: 'a', value: null, error: DUPLICATE_NAME_ERROR },
      { id: 1, name: 'a', value: null, error: DUPLICATE_NAME_ERROR },
    ]);
    state = state.reduce({ action: 'update', id: 1, name: 'b', value: file });
    expect(state.attachments).toEqual([
      { id: 0, name: 'a', value: null, error: NO_FILE_ERROR },
      { id: 1, name: 'b', value: file },
    ]);
    state = state.reduce({ action: 'update', id: 1, value: null });
    expect(state.attachments).toEqual([
      { id: 0, name: 'a', value: null, error: NO_FILE_ERROR },
      { id: 1, name: 'b', value: null, error: NO_FILE_ERROR },
    ]);
  });
});

describe('MultipartAttachmentsInternalContext', () => {
  test('checks if MultipartAttachmentsProvider is available', () => {
    const TestComponent = () => {
      const [, dispatch] = useContext(MultipartAttachmentsInternalContext);
      expect(() => dispatch({ action: 'add' })).toThrow();

      return <div></div>;
    };

    render(<TestComponent />);
  });
});
