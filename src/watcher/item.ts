import * as utils from './utils';

export class EagleItem {
    dirPath: string;
    id: string;
    unlinked: boolean;

    constructor(payload: { id: string; dirPath: string; unlinked?: boolean }) {
        ({
            dirPath: this.dirPath,
            id: this.id,
            unlinked: this.unlinked = false,
        } = payload);
    }

    get ext() {
        return this.metadata.ext;
    }

    get tags() {
        return this.metadata.tags;
    }

    get metadata() {
        const metadata = utils.getItemMetadata(this.dirPath);
        return metadata;
    }
}
