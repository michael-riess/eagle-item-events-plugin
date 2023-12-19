import { FileEvent } from './interfaces/file-event';

export const EVENTS_TRANSLATION_PATTERNS = [
    {
        type: 'add',
        // 1. a file creation followed by any number of additional creations or changes
        checker: (events: FileEvent[]) => {
            if (events[0].type !== 'add') return false;
            if (events.filter((e) => e.type === 'add').length < 2) {
                return false;
            }
            if (events.find((e) => e.type === 'unlink') != null) {
                return false;
            }
            return true;
        },
    },
    {
        type: 'update',
        // 1. any number of exclusively file changes
        // 2. any combination of file changes and/or creations, and file unlinks
        checker: (events: FileEvent[]) => {
            const types = [...new Set(events.map((e) => e.type))];
            if (
                types.length === 1 &&
                (types[0] === 'add' || types[0] === 'unlink')
            ) {
                return false;
            }
            if (types.length === 2 && !types.includes('unlink')) {
                return false;
            }
            return true;
        },
    },
    {
        type: 'delete',
        // 1. any number of exclusively file unlinks
        checker: (events: FileEvent[]) => {
            if (events.find((e) => e.type !== 'unlink') != null) {
                return false;
            }
            return true;
        },
    },
];
export const UNKNOWN_EAGLE_EVENT = {
    type: 'unknown',
};
