export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface Message {
  command: string;
  [key: string]: any;
}

export interface LoadDataMessage extends Message {
  command: 'load-data';
  data: FileNode[];
}

export interface ShowSummaryMessage extends Message {
  command: 'show-summary';
  summary: string;
}

export interface OpenFileMessage extends Message {
  command: 'open-file';
  path: string;
}

export interface GetSummaryMessage extends Message {
  command: 'get-summary';
  path: string;
}
