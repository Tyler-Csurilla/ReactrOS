// Icon type can be an image path, emoji, or any string
export interface IconData {
    id: string;
    icon: string;
    label: string;
    type:
        | 'image'
        | 'application'
        | 'folder'
        | 'yml'
        | 'json'
        | 'text'
        | 'other';
}

// Import static assets here (expand as needed)
import FolderIcon from '@assets/icon_folder.png';
import monkeyIcon from '@assets/icon_monkey.png';

// Default central icon registry
const ICONS: Record<string, IconData> = {
    computer: {
        id: 'computer',
        icon: '🖥️',
        label: 'Computer',
        type: 'application',
    },
    test_item: {
        id: 'test_item',
        icon: '🧪',
        label: 'Test Item Test Item Test Item',
        type: 'application',
    },
    documents: {
        id: 'documents',
        icon: FolderIcon,
        label: 'Documents',
        type: 'folder',
    },
    monke: {
        id: 'monke',
        icon: monkeyIcon,
        label: 'Test Monkey',
        type: 'application',
    },
    network: {
        id: 'network',
        icon: '🌐',
        label: 'Network',
        type: 'application',
    },
    trash: {
        id: 'trash',
        icon: '🗑️',
        label: 'Trash',
        type: 'application',
    },
};

export default class IconManager {
    static getIcon(id: string): IconData | undefined {
        return ICONS[id];
    }

    static getAllIcons(): IconData[] {
        return Object.values(ICONS);
    }
}
