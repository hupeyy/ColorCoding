import type { serverTimestamp } from 'firebase/firestore';

declare global {
    type LobbyStatus = 'Waiting' | 'In Progress' | 'Completed';

    type LobbyPlayer = {
        id: string;
        displayName: string;
    };

    type Lobby = {
        DSA: boolean;
        problemIDs: string[];
        createdAt: ReturnType<typeof serverTimestamp>;
        status: LobbyStatus;
        maxPlayers: number;
        players: Player[];
        host: Player;
        id: string;
        name: string;
        startTime: number;
        playerData: Record<string, {problemsSolved: Record<string, {difficulty: string;}>; solveTime: number;}
        >;
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
        username: string;
        uid: string;
        email: string;
        password: string;
        DSA: boolean;
        rank: number;
    }
}

export {};