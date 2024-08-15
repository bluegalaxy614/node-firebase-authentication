import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newBirthday, setNewBirthday] = useState("");
  const [newGender, setNewGender] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch students from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const studentsCollection = collection(db, "students");
      const studentSnapshot = await getDocs(studentsCollection);
      const studentList = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    };

    // Check if the state passed via navigate has the refresh flag
    if (location.state?.refresh) {
      fetchData();
    } else {
      fetchData(); // Fetch students on component mount
    }
  }, [location.state]);

  // Handle form submission to add a new student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "students"), {
        name: name,
        age: age,
        birthday: birthday,
        gender: gender,
      });
      setName("");
      setAge("");
      setBirthday("");
      setGender("");
      navigate("/student", { state: { refresh: true } });
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  // Handle delete student
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents(students.filter((student) => student.id !== id));
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };

  // Handle editing student
  const handleEdit = (student) => {
    setEditing(student.id);
    setNewName(student.name);
    setNewAge(student.age);
    setNewBirthday(student.birthday);
    setNewGender(student.gender);
  };

  // Handle updating student
  const handleUpdate = async (id) => {
    try {
      const studentDoc = doc(db, "students", id);
      await updateDoc(studentDoc, {
        name: newName,
        age: newAge,
        birthday: newBirthday,
        gender: newGender,
      });
      setStudents(
        students.map((student) =>
          student.id === id
            ? {
                ...student,
                name: newName,
                age: newAge,
                birthday: newBirthday,
                gender: newGender,
              }
            : student
        )
      );
      setEditing(null);
    } catch (error) {
      console.error("Error updating student: ", error);
    }
  };

  // Filter students based on search term across all fields
  const filteredStudents = students.filter((student) =>
    [student.name, student.age.toString(), student.birthday, student.gender]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="student-container"
      style={{ padding: "20px", margin: "10px auto", maxWidth: "600px" }}
    >
      <h2>Student Management</h2>

      {/* Add Student Form */}
      <form
        className="add-student-form"
        onSubmit={handleSubmit}
        style={{ marginBottom: "20px" }}
      >
        <h3>Add Student</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
        />
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          placeholder="Birthday"
        />
        <input
          type="text"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder="Gender"
        />
        <button type="submit">Add Student</button>
      </form>

      {/* Student List */}
      <div className="student-list">
        <h3>Student List</h3>
        <input
          type="text"
          placeholder="Search by any field"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Birthday</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  {editing === student.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  ) : (
                    student.name
                  )}
                </td>
                <td>
                  {editing === student.id ? (
                    <input
                      type="number"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                    />
                  ) : (
                    student.age
                  )}
                </td>
                <td>
                  {editing === student.id ? (
                    <input
                      type="date"
                      value={newBirthday}
                      onChange={(e) => setNewBirthday(e.target.value)}
                    />
                  ) : (
                    student.birthday
                  )}
                </td>
                <td>
                  {editing === student.id ? (
                    <input
                      type="text"
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value)}
                    />
                  ) : (
                    student.gender
                  )}
                </td>
                <td>
                  {editing === student.id ? (
                    <button onClick={() => handleUpdate(student.id)}>
                      Save
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(student)}>
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(student.id)}>
                        <FaTrash /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
