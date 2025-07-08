import { writable } from 'svelte/store';

// Maps problemID to code string
export const saveProblemCode = writable<{ [lobbyID: string]: {[problemID: string]: string} }>({});