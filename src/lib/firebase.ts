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
    where
} from 'firebase/firestore';
import { PUBLIC_FIREBASE_CONFIG } from '$env/static/public';

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
                    ...doc.data(),
                  })) as Lobby[];
            lobbies.set(lobbyData);
        }
    );

    return () => unsubscribe();
}
