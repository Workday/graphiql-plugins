import React, { createContext, Reducer, useReducer } from 'react';
import { AttachmentEntry, MultipartAttachments } from './multipart-attachments.js';

export type AttachmentAddAction = {
  action: 'add';
  name?: string;
};

export type AttachmentUpdateAction = {
  action: 'update';
  id: number;
  name?: string;
  value?: File;
};

export type AttachmentDeleteAction = {
  action: 'delete';
  id: number;
};

export type AttachmentsAction = AttachmentAddAction | AttachmentUpdateAction | AttachmentDeleteAction;

export type InternalAttachmentEntry = { id: number } & (
  | ({ error?: string } & AttachmentEntry)
  | { name: string; value: null; error: string }
);

export const NO_FILE_ERROR = 'No File Attached';
export const DUPLICATE_NAME_ERROR = 'Duplicate Name';

export class InternalAttachmentState {
  private readonly attachmentId;
  public readonly attachments: InternalAttachmentEntry[];

  constructor(attachments: InternalAttachmentEntry[] = [], attachmentId = 0) {
    this.attachments = attachments;
    this.attachmentId = attachmentId;
  }

  public get validAttachments(): AttachmentEntry[] {
    return this.attachments.filter(
      (
        attachment: InternalAttachmentEntry
      ): attachment is AttachmentEntry & {
        id: number;
      } => attachment.value !== null && !attachment.error
    );
  }

  public map<T>(callback: (value: InternalAttachmentEntry, index: number, array: InternalAttachmentEntry[]) => T): T[] {
    return this.attachments.map(callback);
  }

  public reduce(action: AttachmentsAction): InternalAttachmentState {
    let nextAttachments;
    let nextAttachmentId = this.attachmentId;
    switch (action.action) {
      case 'add': {
        nextAttachments = [
          ...this.attachments,
          {
            id: this.attachmentId,
            name: action.name ?? `part${this.attachmentId}`,
            value: null,
          },
        ];
        nextAttachmentId++;
        break;
      }
      case 'update': {
        nextAttachments = this.attachments.map((attachment) => {
          if (attachment.id === action.id) {
            return {
              ...attachment,
              name: action.name ?? attachment.name,
              value: action.value !== undefined ? action.value : attachment.value,
            };
          } else {
            return attachment;
          }
        });
        break;
      }
      case 'delete': {
        nextAttachments = this.attachments.filter((attachment) => attachment.id !== action.id);
        break;
      }
      default: {
        throw new Error(`Unknown action ${action}`);
      }
    }

    for (const attachment of nextAttachments) {
      if (nextAttachments.filter(({ name }) => name === attachment.name).length > 1) {
        attachment.error = DUPLICATE_NAME_ERROR;
      } else if (attachment.value === null) {
        attachment.error = NO_FILE_ERROR;
      } else {
        delete attachment.error;
      }
    }

    return new InternalAttachmentState(nextAttachments as InternalAttachmentEntry[], nextAttachmentId);
  }
}

export const MultipartAttachmentsContext = createContext<MultipartAttachments>(new MultipartAttachments([]));
export const MultipartAttachmentsInternalContext = createContext<
  [InternalAttachmentState, React.Dispatch<AttachmentsAction>]
>([
  new InternalAttachmentState(),
  () => {
    throw new Error('MultipartAttachmentsProvider not found. Make sure to render it higher up in the tree');
  },
]);

export function MultipartAttachmentsProvider({ children }: { children: React.ReactNode }) {
  const [attachments, setAttachmentStates] = useReducer<Reducer<InternalAttachmentState, AttachmentsAction>>(
    (attachments, action) => attachments.reduce(action),
    new InternalAttachmentState()
  );

  return (
    <MultipartAttachmentsContext.Provider value={new MultipartAttachments(attachments.validAttachments)}>
      <MultipartAttachmentsInternalContext.Provider value={[attachments, setAttachmentStates]}>
        {children}
      </MultipartAttachmentsInternalContext.Provider>
    </MultipartAttachmentsContext.Provider>
  );
}
