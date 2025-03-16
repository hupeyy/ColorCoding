import type { serverTimestamp } from 'firebase/firestore';

declare global {
    type Lobby = {
        DSA: boolean;
        userIDs: string[];
        createdAt: serverTimestamp;
    }
}

export {};