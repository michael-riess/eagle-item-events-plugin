const path = require('path');

export function getItemDir(filePath: string) {
    return filePath.split(path.sep).at(-2);
}

export function getItemDirPath(filePath: string) {
    return filePath.split(path.sep).slice(0, -1).join(path.sep);
}

export function getItemId(filePath: string) {
    return filePath.split('.info')[0].split(path.sep).at(-1) as string;
}

export function getItemName(filePath: string) {
    return path.basename(filePath, path.extname(filePath));
}

export function getItemFileName(filePath: string) {
    return path.basename(filePath);
}

export function getItemExt(filePath: string) {
    return path.extname(filePath);
}

export function getItemMetadata(itemDirPath: string) {
    try {
        return require(path.join(itemDirPath, 'metadata.json'));
    } catch (error) {
        console.error(`Unknown error while reading item metadata: ${error}`);
    }
    return {};
}

export function getLastFileChangeMillis(stats: any) {
    if (stats == null) return Date.now();
    return Math.max(
        stats.atimeMs,
        stats.birthtimeMs,
        stats.ctimeMs,
        stats.mtimeMs
    );
}
