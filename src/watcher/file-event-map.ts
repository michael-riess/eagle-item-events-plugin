import { Subject } from 'rxjs';
import { FileEvent } from './interfaces/file-event';

export class FileEventMapV2 {
    #events: Map<string, FileEvent[]>;
    #expiryMillis: number;
    #expirators: Map<string, NodeJS.Timeout>;

    completed$ = new Subject<FileEvent[]>();

    constructor(expiryMillis = 5000) {
        this.#expiryMillis = expiryMillis;
        this.#events = new Map();
        this.#expirators = new Map();
    }

    add(id: string, fileEvent: FileEvent) {
        let events = this.get(id);
        if (!events?.length) {
            events = [];
        }
        events.push(fileEvent);
        this.#events.set(id, events);

        const expirator = this.#expirators.get(id);

        // reset the expiry timer
        if (expirator) {
            clearTimeout(expirator);
        }
        this.#expirators.set(
            id,
            setTimeout(() => {
                const events = this.#events.get(id);
                if (!events?.length) {
                    throw new Error('Event collection deleted before expiry');
                }
                this.completed$.next(events);
                this.#events.delete(id);
            }, this.#expiryMillis)
        );
    }

    get(id: string) {
        const events = this.#events.get(id);
        if (!events?.length) {
            return null;
        }

        // if the event is older than the grouping time, ignore it since it is almost certainly not part of the same item action
        const now = Date.now();
        const lastEvent = events.reduce(
            (acc, curr) => (acc.time > curr.time ? acc : curr),
            events[0]
        );
        return now - lastEvent.time <= this.#expiryMillis ? events : null;
    }

    delete(id: string) {
        this.#events.delete(id);
    }
}
