import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    onIdTokenChanged,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { readable, writable, type Subscriber } from 'svelte/store';
import { getFirestore, onSnapshot } from 'firebase/firestore';
import {
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
                    // id: doc.id,
                    ...doc.data(),
                  })) as Player[];
            players.set(playerData);
        }
    );
    return () => unsubscribe();
}

export async function createPlayer(user: Omit<Player, 'id'>) {
    const userRef = await addDoc(collection(db, 'players'), user);
    await updateDoc(userRef, {id: userRef.id});
    return userRef.id;
}