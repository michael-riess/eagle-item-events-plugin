import { Subject, switchMap, takeUntil, map, throwError, of } from 'rxjs';
import { FileEventMapV2 } from './file-event-map';
import {
    EVENTS_TRANSLATION_PATTERNS,
    UNKNOWN_EAGLE_EVENT,
} from './events-translation-patterns';
import { EagleItem } from './item';
import { FileEvent } from './interfaces/file-event';

export class EventsTransformer {
    #fileEvents$ = new Subject<FileEvent>();
    #fileEventsMap = new FileEventMapV2();
    #onDestroy$ = new Subject<void>();

    eagleEvents$ = new Subject<{ type: string; item: EagleItem }>();

    constructor() {
        this.#fileEvents$
            .pipe(takeUntil(this.#onDestroy$))
            .subscribe((event) => this.#fileEventsMap.add(event.id, event));

        this.#fileEventsMap.completed$
            .pipe(
                map((fileEvents) => this.fileEventsToEagleEvent(fileEvents)),
                switchMap((eagleEvent) => {
                    return eagleEvent.type != null
                        ? of(eagleEvent)
                        : throwError(
                              () => new Error('Unknown eagle event type')
                          );
                })
            )
            .subscribe({
                next: (event) => this.eagleEvents$.next(event),
                error: (err) => console.error(err),
            });

        eagle.onPluginBeforeExit(() => this.#onDestroy$.next());
    }

    addFileEvent(fileEvent: FileEvent) {
        this.#fileEvents$.next(fileEvent);
    }

    fileEventsToEagleEvent(fileEvents: FileEvent[]) {
        const eagleEvent =
            EVENTS_TRANSLATION_PATTERNS.find((p) => p.checker(fileEvents)) ??
            UNKNOWN_EAGLE_EVENT;
        const { dirPath, id } = fileEvents[0];
        return {
            type: eagleEvent.type,
            item: new EagleItem({
                dirPath,
                id,
                unlinked: eagleEvent.type === 'unlink',
            }),
        };
    }
}
