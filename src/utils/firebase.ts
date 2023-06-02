import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  CategoryType,
  MessageType,
  StudyGroupType,
  UpdateDataType,
  UserType,
} from '../types/types';
import { db } from './firebaseConfig';

type ViewerType = {
  uuid: string;
  name: string;
};

const data = {
  async getUserGroup(email: string): Promise<StudyGroupType[]> {
    const userRef = doc(db, 'users', email);
    const userStudyGroupsRef = collection(userRef, 'userStudyGroups');
    const userStudyGroupsSnapshot = await getDocs(userStudyGroupsRef);

    const groupPromises = userStudyGroupsSnapshot.docs.map(async (groupDoc) => {
      const groupId = groupDoc.id;
      const groupNote = groupDoc.data().note;
      const studyGroupRef = doc(db, 'studyGroups', groupId);

      const studyGroupDoc = await getDoc(studyGroupRef);
      const studyGroupData = studyGroupDoc.data() as StudyGroupType;
      const { startTime } = studyGroupData;

      return {
        id: groupId,
        note: groupNote,
        startTime: startTime,
        ...studyGroupDoc.data(),
      };
    });
    const allGroupsData = (await Promise.all(
      groupPromises
    )) as StudyGroupType[];

    allGroupsData.sort((a, b) => {
      return a.startTime.seconds - b.startTime.seconds;
    });
    return allGroupsData;
  },
  async getGroupsData() {
    const StudyGroupsData = collection(db, 'studyGroups');
    const groupsSnapshot = await getDocs(StudyGroupsData);
    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return groups;
  },
  async getUnfinishedGroups() {
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
  async getCategory(category: CategoryType) {
    const studyGroupsRef = collection(db, 'studyGroups');
    const q = query(
      studyGroupsRef,
      where('category', '==', category),
      where('status', '!=', 'finished')
    );
    const querySnapshot = await getDocs(q);
    let groups: { id: string }[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    return groups;
  },
  async getGroup(id: string) {
    const studyGroupRef = doc(db, 'studyGroups', id);
    const studyGroupDoc = await getDoc(studyGroupRef);
    const group = { id: studyGroupDoc.id, ...studyGroupDoc.data() };
    return group;
  },
  async getTemplates() {
    const templatesCollectionRef = collection(db, 'templates');
    const templatesSnapshot = await getDocs(templatesCollectionRef);
    const templatesData = templatesSnapshot.docs.map((doc) => doc.data());
    return templatesData;
  },
  async getUser(email: string) {
    const userDocRef = doc(db, 'users', email);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    return userData;
  },
  async updateDocument(
    id: string,
    collection: string,
    updateData: UpdateDataType
  ) {
    await updateDoc(doc(db, collection, id), { ...updateData });
  },
  async setUserGroup(
    id: string,
    email: string,
    userGroupData: {
      note: string;
    }
  ) {
    const userGroupRef = doc(db, 'users', email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { ...userGroupData });
  },
  async setDocument(
    id: string,
    collection: string,
    data:
      | StudyGroupType
      | UserType
      | { currentCard: number; viewers: ViewerType[] }
  ) {
    await setDoc(doc(db, collection, id), { ...data });
  },
  async addGroup(groupData: StudyGroupType) {
    return await addDoc(collection(db, 'studyGroups'), {
      ...groupData,
    });
  },
  async addMessage(id: string, messageData: MessageType) {
    await addDoc(collection(db, 'rooms', id, 'messages'), {
      ...messageData,
    });
  },
  async addIceCandidate(id: string, type: string, data: Object | null) {
    addDoc(collection(db, 'rooms', id, type), data);
  },
  async updateGroupStatus(id: string) {
    const groupRef = doc(db, 'studyGroups', id);
    const groupSnapshot = await getDoc(groupRef);
    const groupData = groupSnapshot.data() as StudyGroupType;

    if (groupData.process === undefined || groupData.process.length === 0) {
      throw new Error('請新增至少一個流程!');
    } else {
      await updateDoc(groupRef, { status: 'ongoing' });
    }
  },
  async deleteField(id: string) {
    const roomRef = doc(db, 'rooms', id);
    await updateDoc(roomRef, {
      offer: deleteField(),
      answer: deleteField(),
    });
  },
  async quitGroup(id: string, user: UserType) {
    const userEmail = user?.email;
    if (userEmail) {
      const usersDocRef = doc(db, 'users', userEmail);
      const userStudyGroupsRef = collection(usersDocRef, 'userStudyGroups');
      const groupRef = doc(userStudyGroupsRef, id);
      await deleteDoc(groupRef);
    } else {
      console.log('UserType error');
    }
  },
  async delUserGroup(id: string) {
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
  async delGroup(id: string, collection: string) {
    await deleteDoc(doc(db, collection, id));
  },
};
export default data;
