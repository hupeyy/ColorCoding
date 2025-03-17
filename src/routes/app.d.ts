import type { serverTimestamp } from 'firebase/firestore';

declare global {
    type Lobby = {
        id: string;
        DSA: boolean;
        userIDs: string[];
        problemIDs: string[];
        createdAt: serverTimestamp;
    }

    type Problem = {
        id: string;
        title: string;
        description: string;
        testCases: string[];
    }
}

export {};