interface Library {
    info: () => any; // TODO: create type
    path: string;
    name: string;
    modificationTime: number;
}

interface EagleItem {
    dirPath: string;
    unlinked: boolean;
    id: string;
    ext: string;
    tags: string[];
    metadata: any; // TODO: create type
}

interface Eagle {
    // native eagle props
    library: Library;
    item: any; // TODO: create type

    // native eagle event callbacks
    onPluginCreate: (callback: (data: any) => void) => void;
    onPluginRun: (callback: (data: any) => void) => void;
    onPluginBeforeExit: (callback: (data: any) => void) => void;
    onPluginShow: (callback: (data: any) => void) => void;
    onPluginHide: (callback: (data: any) => void) => void;
    onLibraryChanged: (callback: (data: any) => void) => void;
    onThemeChanged: (callback: (data: any) => void) => void;

    // custom eagle event callbacks
    onItemAdded: (callback: (item: EagleItem) => void) => void;
    onItemUpdated: (callback: (item: EagleItem) => void) => void;
    onItemDeleted: (callback: (item: EagleItem) => void) => void;
}
declare var eagle: Eagle;
