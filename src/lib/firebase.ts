import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    onIdTokenChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { readable, writable, type Subscriber } from 'svelte/store';
import { getFirestore, onSnapshot } from 'firebase/firestore';
import {
    setDoc,
    addDoc,
    collection,
    deleteDoc,
    doc,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    getDoc,
    where,
    getDocs
} from 'firebase/firestore';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { PUBLIC_FIREBASE_CONFIG } from '$env/static/public';

// only need right now to create guestUser
export const guestUser = writable<LobbyPlayer | null>(null);
export function createGuest(displayName: string) {
    const guest = {
        id: crypto.randomUUID(),
        displayName
    };
    guestUser.set(guest);
    return guest;
}

const config = JSON.parse(PUBLIC_FIREBASE_CONFIG);
const app = initializeApp(config);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
setPersistence(auth, browserLocalPersistence)

const db = getFirestore(app);

export const lobbies = writable<Lobby[] | null>(null);

export function getLobbies() {
    const unsubscribe = onSnapshot(
        query(
            collection(db, 'lobbies'),
            orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
            const lobbyData = snapshot.empty
                ? []
                : snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  })) as Lobby[];
            lobbies.set(lobbyData);
        }
    );

    return () => unsubscribe();
}

export const guestLobbies = writable<Lobby[] | null>(null);
export function getGuestLobbies() {
    const unsubscribe = onSnapshot(
        // retrieve guestLobbies by time created descending
        query(
            collection(db, 'guestLobbies'),
            orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
            const lobbyData = snapshot.empty
                ? []
                : snapshot.docs.map((doc) => ({
                    // id: doc.id,
                    ...doc.data(),
                  })) as Lobby[];
            guestLobbies.set(lobbyData);
        }
    );

    return () => unsubscribe();
}

export async function createLobby(host: LobbyPlayer, name: string, maxPlayers: number, DSA: boolean, problemIDs: string[])  {
    // Lobby document to be added to collection 'guestLobbies' on Firebase
    const newLobby: Omit<Lobby, 'id'> = {
        DSA,
        userIDs: [host.id],
        problemIDs,
        createdAt: serverTimestamp(),
        status: 'waiting',
        maxPlayers,
        players: [host],
        host,
        name
    };
    // Add this guestLobby doc to collection 'guestLobbies' in Firebase
    const lobbyref = await addDoc(collection(db, 'guestLobbies'), newLobby);
    // Add the lobby's id to firebase
    await updateDoc(lobbyref, {id: lobbyref.id});
    return lobbyref.id;
}

export async function joinLobby(lobbyId: string, player: LobbyPlayer) {
    const lobbyref = doc(db, 'guestLobbies', lobbyId);
    const lobbySnapshot = await getDoc(lobbyref);

    if(!lobbySnapshot.exists()) throw new Error("Lobby not found");

    const lobby = lobbySnapshot.data() as Lobby;

    const alreadyJoined = lobby.players.some(p => p.id === player.id);
    if(alreadyJoined) {throw new Error("Already joined lobby")}
    
    if(lobby.players.length >= lobby.maxPlayers) {throw new Error("Lobby is full");}

    const updatePlayers = [...lobby.players, player];
    const updateuserIDs = [...lobby.userIDs, player.id];

    await updateDoc(lobbyref, {
        players: updatePlayers,
        userIDs: updateuserIDs
    });
}

export const problems = writable<Problem[] | null>(null);
export async function getProblems() {
    const unsubscribe = onSnapshot(
        query(
            collection(db, 'problems'),
            orderBy('title', 'asc')
        ),
        (snapshot) => {
            const problemData = snapshot.empty
                ? []
                : snapshot.docs.map((doc) => ({
                    // id: doc.id,
                    ...doc.data(),
                  })) as Problem[];
            problems.set(problemData);
        }
    );
    return () => unsubscribe();
}

export async function createProblem(problem: Omit<Problem, 'id'>) {
    const problemRef = await addDoc(collection(db, 'problems'), problem);
    await updateDoc(problemRef, {id: problemRef.id});
    return problemRef.id;
}

export const players = writable<Player[] | null>(null);
export async function getPlayers() {
    const unsubscribe = onSnapshot(
        query(
            collection(db, 'players'),
            orderBy('displayName', 'asc')
        ),
        (snapshot) => {
            const playerData = snapshot.empty
                ? []
                : snapshot.docs.map((doc) => ({
                    ...doc.data(),
                  })) as Player[];
            players.set(playerData);
        }
    );
    return () => unsubscribe();
}

export async function createPlayer(player: Player) {
    try {
        // Check if player already exists in the database
        let playerRef = doc(db, 'players', player.email);
        const playerSnapshot = await getDoc(playerRef);

        if (playerSnapshot.exists()) {
            throw new Error("Player already exists");
        } 

        const userCredential = await createUserWithEmailAndPassword(auth, player.email, player.password);
        const user = userCredential.user;

        if (player.username) {
            await updateProfile(user, { 
                displayName: player.username 
            });
        }

        await setDoc(playerRef, {
            ...player,
            uid: user.uid
        })
    } catch (error: any) {
        console.error("Error creating player:", error);
        throw new Error("Error creating player: " + error.message);
    }
}

export const currentPlayer = writable<Player | null>(null);
export function getCurrentPlayer() {
    const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
        if (user) {
            const playerRef = doc(db, 'players', user.email!);
            const playerSnapshot = await getDoc(playerRef);

            if (playerSnapshot.exists()) {
                currentPlayer.set(playerSnapshot.data() as Player);
            } else {
                currentPlayer.set(null);
            }
        } else {
            currentPlayer.set(null);
        }
    });

    return () => unsubscribe();
}

export async function signIn(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const playerRef = doc(db, 'players', user.email!);
        const playerSnapshot = await getDoc(playerRef);

        if (playerSnapshot.exists()) {
            const playerData = playerSnapshot.data() as Player;
            currentPlayer.set(playerData);
        } else {
            throw new Error("Player not found");
        }
    } catch (error: any) {
        throw new Error("Sign in failed ", error);
    }
}