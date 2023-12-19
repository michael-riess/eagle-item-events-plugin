export type FileEventType = 'add' | 'change' | 'unlink';

export interface FileEvent {
    dirPath: string;
    fileName: string;
    id: string;
    name: string;
    time: number;
    type: FileEventType;
}
