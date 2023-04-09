import { db } from './firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

const data = {
  async loadGroupData() {
    const userRef = doc(db, 'users', 'yumy19990628@gmail.com');
    const userStudyGroupsRef = collection(userRef, 'userStudyGroups');
    const userStudyGroupsSnapshot = await getDocs(userStudyGroupsRef);

    const allGroupsData = [];

    for (const groupDoc of userStudyGroupsSnapshot.docs) {
      const groupId = groupDoc.id;
      const groupNote = groupDoc.data().note;
      const studyGroupRef = doc(db, 'studyGroups', groupId);
      const studyGroupDoc = await getDoc(studyGroupRef);

      allGroupsData.push({
        id: groupId,
        note: groupNote,
        ...studyGroupDoc.data(),
      });
    }
    return allGroupsData;
  },
};
export default data;