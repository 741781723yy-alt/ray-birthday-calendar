import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Wish {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  starX: number;
  starY: number;
  createdAt: number;
}

interface WishDoc {
  text: string;
  authorName: string;
  authorId: string;
  starX: number;
  starY: number;
  createdAt: Timestamp | null;
}

export function subscribeWishes(
  onUpdate: (wishes: Wish[]) => void,
): () => void {
  const q = query(collection(db, 'wishes'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const wishes: Wish[] = snap.docs.map((doc) => {
      const d = doc.data() as WishDoc;
      return {
        id: doc.id,
        text: d.text,
        authorName: d.authorName,
        authorId: d.authorId,
        starX: d.starX,
        starY: d.starY,
        createdAt: d.createdAt?.toMillis() ?? Date.now(),
      };
    });
    onUpdate(wishes);
  });
}

export async function addWish(
  text: string,
  authorName: string,
  authorId: string,
  starX: number,
  starY: number,
): Promise<string> {
  const ref = await addDoc(collection(db, 'wishes'), {
    text,
    authorName,
    authorId,
    starX,
    starY,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWish(id: string, text: string): Promise<void> {
  await updateDoc(doc(db, 'wishes', id), { text });
}

export async function deleteWish(id: string): Promise<void> {
  await deleteDoc(doc(db, 'wishes', id));
}
