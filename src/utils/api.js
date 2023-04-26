import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';

const data = {
  async fetchUserGroup(email) {
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
      return a.hold.seconds - b.hold.seconds;
    });
    return allGroupsData;
  },
};
export default data;
