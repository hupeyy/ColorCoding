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
        problemIDs: string[];
        createdAt: ReturnType<typeof serverTimestamp>;
        status: LobbyStatus;
        maxPlayers: number;
        players: LobbyPlayer[];
        host: LobbyPlayer;
        id: string;
        name: string;
    }

    type Problem = {
        id: string;
        title: string;
        difficulty: string;
        description: string;
        inputs: string[];
        outputs: string[];
    }

    type Player = {
        id: string;
        username: string;
        email: string;
        password: string;
        DSA: boolean;
    }
}

export {};