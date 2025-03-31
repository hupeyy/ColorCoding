import type { serverTimestamp } from 'firebase/firestore';

declare global {
    type LobbyStatus = 'waiting' | 'in progress' | 'completed';

    type LobbyPlayer = {
        id: string;
        displayName: string;
    };

    type Lobby = {
        DSA: boolean;
        userIDs: string[];
        createdAt: serverTimestamp;
        status: LobbyStatus;
        maxPlayers: number;
        players: LobbyPlayer[];
        host: LobbyPlayer;
        id: string;
        name: string;
    }
}

export {};