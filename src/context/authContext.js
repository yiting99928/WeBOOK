// import { createContext, useState, useEffect } from "react";
// import { getAuth,onAuthStateChanged } from "firebase/auth";
// export const UserContext = createContext({});

// useEffect(() => {
//     const auth = getAuth();
//     onAuthStateChanged(auth, (user) => {
//       console.log("usecontext_user",user)
//       if (user) {
//         const data = {
//           name: user.name || "",
//           account: user.email || "",
//           image: user.photoURL || "",
//           uid: user.uid || "",
//           classes: user.classes || [],
//         };
//         setUser(data);        
//         setIsLogin(true);
//       } else {
//         setUser();
//         setIsLogin(false);
//       }
//     });
//   }, []);