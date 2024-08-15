import React, { useEffect, useState } from "react";
import { db } from "../firebase-config"; // Adjust the path according to your project structure
import { collection, getDocs } from "firebase/firestore";

export default function Records() {
  const [users, setUsers] = useState([]);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const record = (user) => {
      if (user.displayName !== "" || user.gender !== "" || user.age !== "") {
        return (
            <tr key={user.id}>
              <td>{user.displayName}</td>
              <td>{user.gender}</td>
              <td>{user.age}</td>
            </tr>
        )
      } 
  }

  return (
    <div className="student-list">
      <h2>User Records</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => 
            record(user)
        )}
        </tbody>
      </table>
    </div>
  );
}
