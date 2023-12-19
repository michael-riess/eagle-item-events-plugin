import { Subject, Subscription, takeWhile, tap } from 'rxjs';
import {
    getItemDirPath,
    getItemFileName,
    getItemId,
    getItemName,
    getLastFileChangeMillis,
} from './utils';
import { EventsTransformer } from './events-transformer';
import { FileEvent, FileEventType } from './interfaces/file-event';
import { EagleItem } from './item';

const chokidar = require('chokidar');
interface ChokidarWatcher {
    on: (
        event: string,
        callback: (filePath: string, stats: any) => void
    ) => void;
    close: () => Promise<void>;
}

export class Watcher {
    #fileEvents = {
        onFileAdded: new Subject<FileEvent>(),
        onFileUnlinked: new Subject<FileEvent>(),
        onFileChanged: new Subject<FileEvent>(),
    };
    #itemEventHandlers = {
        onItemAdded: (_item: EagleItem) => {},
        onItemDeleted: (_item: EagleItem) => {},
        onItemUpdated: (_item: EagleItem) => {},
    };

    #eventsTransformer = new EventsTransformer();

    #watcher: ChokidarWatcher | undefined = undefined;
    #watcherEventSubscriptions: Subscription[] = [];

    constructor() {
        this.#createNewEagleEvents();
        eagle.onPluginCreate(() => {
            this.#setWatcher();
        });
        eagle.onLibraryChanged(() => {
            this.#setWatcher();
        });
        eagle.onPluginBeforeExit(() => this.close());
        this.#eventsTransformer.eagleEvents$.subscribe((event) => {
            switch (event.type) {
                case 'add':
                    this.#itemEventHandlers.onItemAdded(event.item);
                    break;
                case 'update':
                    this.#itemEventHandlers.onItemUpdated(event.item);
                    break;
                case 'delete':
                    this.#itemEventHandlers.onItemDeleted(event.item);
                    break;
                default:
                    throw new Error('Unknown eagle event type');
            }
        });
    }

    #createFileEvent(
        filePath: string,
        stats: any,
        type: FileEventType
    ): FileEvent {
        const dirPath = getItemDirPath(filePath);
        const fileName = getItemFileName(filePath);
        const id = getItemId(dirPath);
        const time = getLastFileChangeMillis(stats);
        const name = getItemName(filePath);
        return {
            dirPath,
            fileName,
            id,
            name,
            time,
            type,
        };
    }

    #createNewEagleEvents() {
        eagle.onItemAdded = (callback: (item: EagleItem) => void) => {
            if (typeof callback !== 'function') {
                throw new Error('callback must be a function');
            }
            this.#itemEventHandlers.onItemAdded = callback;
        };
        eagle.onItemUpdated = (callback: (item: EagleItem) => void) => {
            if (typeof callback !== 'function') {
                throw new Error('callback must be a function');
            }
            this.#itemEventHandlers.onItemUpdated = callback;
        };
        eagle.onItemDeleted = (callback: (item: EagleItem) => void) => {
            if (typeof callback !== 'function') {
                throw new Error('callback must be a function');
            }
            this.#itemEventHandlers.onItemDeleted = callback;
        };
    }

    async #setWatcher() {
        const libraryPath = `${eagle.library.path}/images`;

        // cleanup previous watcher and subscriptions if they exist
        await this.close();

        this.#watcher = chokidar.watch(libraryPath, {
            atomic: true,
            depth: 3,
            ignoreInitial: true,
            ignorePermissionErrors: false,
            persistent: true,
        }) as ChokidarWatcher;

        if (!this.#watcher) {
            throw new Error('Failed to create watcher');
        }

        this.#watcher.on('add', (filePath, stats) => {
            this.#fileEvents.onFileAdded.next(
                this.#createFileEvent(filePath, stats, 'add')
            );
        });
        this.#watcher.on('change', (filePath, stats) => {
            this.#fileEvents.onFileChanged.next(
                this.#createFileEvent(filePath, stats, 'change')
            );
        });
        this.#watcher.on('unlink', (filePath) => {
            this.#fileEvents.onFileUnlinked.next(
                this.#createFileEvent(filePath, null, 'unlink')
            );
        });

        this.#watcherEventSubscriptions.push(
            this.#fileEvents.onFileAdded
                .pipe(
                    takeWhile(() => this.#watcher != null),
                    tap((event) => this.#eventsTransformer.addFileEvent(event))
                )
                .subscribe(),
            this.#fileEvents.onFileChanged
                .pipe(
                    takeWhile(() => this.#watcher != null),
                    tap((event) => this.#eventsTransformer.addFileEvent(event))
                )
                .subscribe(),
            this.#fileEvents.onFileUnlinked
                .pipe(
                    takeWhile(() => this.#watcher != null),
                    tap((event) => this.#eventsTransformer.addFileEvent(event))
                )
                .subscribe()
        );
    }

    async close() {
        if (this.#watcher) {
            await this.#watcher.close();
        }
        this.#watcher = undefined;
        this.#watcherEventSubscriptions.forEach((subscription) =>
            subscription?.unsubscribe()
        );
        this.#watcherEventSubscriptions = [];
    }
}
