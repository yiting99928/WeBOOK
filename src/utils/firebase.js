import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const data = {
  async getUserGroup(email) {
    const userRef = doc(db, 'users', email);
    const userStudyGroupsRef = collection(userRef, 'userStudyGroups');
    const userStudyGroupsSnapshot = await getDocs(userStudyGroupsRef);

    const groupPromises = userStudyGroupsSnapshot.docs.map(async (groupDoc) => {
      const groupId = groupDoc.id;
      const groupNote = groupDoc.data().note;
      const studyGroupRef = doc(db, 'studyGroups', groupId);

      const studyGroupDoc = await getDoc(studyGroupRef);

      return {
        id: groupId,
        note: groupNote,
        ...studyGroupDoc.data(),
      };
    });
    const allGroupsData = await Promise.all(groupPromises);

    allGroupsData.sort((a, b) => {
      return a.startTime.seconds - b.startTime.seconds;
    });
    return allGroupsData;
  },
  async getAllGroups() {
    const StudyGroupsData = collection(db, 'studyGroups');
    const q = query(
      StudyGroupsData,
      where('status', '!=', 'finished'),
      orderBy('status'),
      orderBy('startTime')
    );

    const groupsSnapshot = await getDocs(q);
    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return groups;
  },
  async getCategory(category) {
    const studyGroupsRef = collection(db, 'studyGroups');
    const q = query(
      studyGroupsRef,
      where('category', '==', category),
      where('status', '!=', 'finished')
    );
    const querySnapshot = await getDocs(q);
    let groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    return groups;
  },
  async getGroup(id) {
    const studyGroupRef = doc(db, 'studyGroups', id);
    const studyGroupDoc = await getDoc(studyGroupRef);
    const group = { id: studyGroupDoc.id, ...studyGroupDoc.data() };
    return group;
  },
  async setGroup(id, user) {
    const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { note: '' });
  },
  async quitGroup(id, user) {
    const usersDocRef = doc(db, 'users', user.email);
    const userStudyGroupsRef = collection(usersDocRef, 'userStudyGroups');
    const groupRef = doc(userStudyGroupsRef, id);
    await deleteDoc(groupRef);
  },
  async delUserGroup(id) {
    const usersQuerySnapshot = await getDocs(collection(db, 'users'));

    await Promise.all(
      usersQuerySnapshot.docs.map(async (userDoc) => {
        const userStudyGroupsRef = collection(userDoc.ref, 'userStudyGroups');
        const matchingGroupsQuery = query(
          userStudyGroupsRef,
          where('__name__', '==', id)
        );
        const matchingGroupsSnapshot = await getDocs(matchingGroupsQuery);

        await Promise.all(
          matchingGroupsSnapshot.docs.map(async (matchingGroupDoc) => {
            try {
              await deleteDoc(matchingGroupDoc.ref);
            } catch (error) {
              console.error(error);
            }
          })
        );
      })
    );
  },
  async delGroup(id) {
    await deleteDoc(doc(db, 'studyGroups', id));
  },
  async updateGroupStatus(id) {
    const groupRef = doc(db, 'studyGroups', id);
    const groupSnapshot = await getDoc(groupRef);
    const groupData = groupSnapshot.data();

    if (groupData.process === undefined || groupData.process.length === 0) {
      throw new Error('請新增至少一個流程!');
    } else {
      await updateDoc(groupRef, { status: 'ongoing' });
    }
  },
};
export default data;
