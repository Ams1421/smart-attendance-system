import { ref, get } from "firebase/database";
import { db } from "../firebase";

export async function getUserRole(uid) {
  const snap = await get(ref(db, `roles/${uid}`));
  return snap.exists() ? snap.val() : null;
}
