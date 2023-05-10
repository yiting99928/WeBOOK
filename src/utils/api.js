import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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
      return a.startTime.seconds - b.startTime.seconds;
    });
    return allGroupsData;
  },
};
export default data;
