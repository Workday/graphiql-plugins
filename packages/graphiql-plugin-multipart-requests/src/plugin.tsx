import { GraphiQLPlugin, PenIcon, TrashIcon, useGraphiQL } from '@graphiql/react';
import React, { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import uploadClipSvg from './attachment-icon.svg.js';
import { AttachmentDeleteAction, AttachmentUpdateAction, MultipartAttachmentsInternalContext } from './context.js';

import '../../style.css';

type AttachmentContentProps = {
  name: string;
  value: File | null;
  updateAttachment: (action: Omit<AttachmentUpdateAction, 'id'> | Omit<AttachmentDeleteAction, 'id'>) => void;
  error?: string;
};

const GRAPHIQL_PLUGIN: GraphiQLPlugin = {
  title: 'Multipart Attachments',
  icon: () => {
    const [attachments] = useContext(MultipartAttachmentsInternalContext);
    const visiblePlugin = useGraphiQL(state => state.visiblePlugin);

    const style: CSSProperties = {
      fontFamily: 'var(--font-family-mono)',
      fontSize: 'var(--font-size-inline-code)',
      textAlign: 'center',
      width: 'auto',
    };
    if (visiblePlugin === GRAPHIQL_PLUGIN) {
      style.fontWeight = 'bold';
    }

    return (
      <div className='attachments-icon'>
        {uploadClipSvg}
        {attachments.validAttachments.length > 0 ? (
          <span className='attachments-icon-badge'>{attachments.validAttachments.length}</span>
        ) : (
          <></>
        )}
      </div>
    );
  },
  content: () => {
    const [attachments, attachmentsDispatch] = useContext(MultipartAttachmentsInternalContext);

    return (
      <div className={'attachments-container'}>
        <h2>Multipart Attachments</h2>
        {attachments.map(({ id, name, value, error }) => {
          return (
            <AttachmentContent
              key={id}
              name={name}
              value={value}
              updateAttachment={(action) => attachmentsDispatch({ ...action, id })}
              error={error}
            />
          );
        })}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => attachmentsDispatch({ action: 'add' })}>Add Part</button>
        </div>
      </div>
    );
  },
};

export function AttachmentContent({ name, value, updateAttachment, error }: AttachmentContentProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={'attachment-content'}>
      <div className={'attachment-title'}>
        <PartNameComponent name={name} setName={(name) => updateAttachment({ action: 'update', name })} />
        <button onClick={() => updateAttachment({ action: 'delete' })} className={'attachment-delete'}>
          <TrashIcon />
        </button>
      </div>
      {error ? <div className='graphiql-doc-explorer-error'>{error}</div> : <></>}
      {value ? <PartHeadersComponent name={name} value={value} /> : <></>}
      <div>
        <button style={{ marginTop: '0.5em' }} onClick={() => fileInputRef.current?.click()}>
          Attach File
        </button>
        <input
          type='file'
          ref={fileInputRef}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              updateAttachment({ action: 'update', value: file });
            }
          }}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export function PartNameComponent({ name, setName }: { name: string; setName: (name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  function endEditing() {
    setIsEditing(false);
    if (inputRef.current) {
      setName(inputRef.current.value);
    }
  }
  function onSubmit(event: React.BaseSyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    endEditing();
  }

  if (isEditing) {
    return (
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type='text'
          defaultValue={name}
          onBlur={endEditing}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onSubmit(e);
            }
          }}
        />
      </form>
    );
  } else {
    return (
      <>
        <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
          {name}
          &nbsp;
          <PenIcon />
        </span>
      </>
    );
  }
}

export function PartHeadersComponent({ name, value }: { name: string; value: File }) {
  const baseContentDisposition = `form-data; name="${encodeURIComponent(name)}"`;
  let headers;
  if (typeof value !== 'string') {
    headers = [
      ['Content-Disposition', `${baseContentDisposition}; filename="${encodeURIComponent(value.name)}"`],
      ['Content-Type', value.type.length > 0 ? value.type : 'application/octet-stream'],
    ];
  } else {
    headers = [['Content-Disposition', baseContentDisposition]];
  }

  return (
    <div className={'attachment-header'}>
      {headers.map(([name, value]) => (
        <div key={name}>
          <span style={{ color: 'hsl(var(--color-info))' }}>{name}: </span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

export default GRAPHIQL_PLUGIN;
