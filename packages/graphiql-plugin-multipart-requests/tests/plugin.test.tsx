/** @jest-environment jsdom */

import { AttachmentContent, PartHeadersComponent, PartNameComponent } from '../src/plugin.js';
import { act, render } from '@testing-library/react';

jest.mock('@graphiql/react', () => {
  return {
    PenIcon: () => <div>PenIcon</div>,
    TrashIcon: () => <div>PenIcon</div>,
    usePluginContext: () => null,
  };
});

describe('AttachmentContent', () => {
  test('renders a valid attachment', () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      render(<AttachmentContent name='a' value={new File([], 'A')} updateAttachment={() => {}} />).container
    ).toMatchSnapshot();
  });
  test('renders an invalid attachment', () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      render(<AttachmentContent name='a' value={new File([], 'A')} error={'File Error!'} updateAttachment={() => {}} />)
        .container
    ).toMatchSnapshot();
  });
});

describe('PartNameComponent', () => {
  test('renders a part', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(render(<PartNameComponent name='a' setName={() => {}} />).container).toMatchSnapshot();
  });

  test('updates a name', () => {
    const setName = jest.fn();
    const container = document.body.appendChild(document.createElement('div'));
    act(() => {
      return render(<PartNameComponent name='a' setName={setName} />, { container });
    });
    act(() => {
      container.querySelector('span')!.click();
    });
    act(() => {
      const input = container.querySelector('input')!;
      input.value = 'newName';
      input.blur();
    });
    expect(setName).toHaveBeenCalledWith('newName');
  });
});
describe('PartHeadersComponent', () => {
  test('renders a file', () => {
    expect(
      render(<PartHeadersComponent name='a' value={new File([], 'A', { type: 'text/plain' })} />).container
    ).toMatchSnapshot();
  });
  test('defaults to octet-stream', () => {
    expect(render(<PartHeadersComponent name='a' value={new File([], 'A')} />).container).toMatchSnapshot();
  });
});
