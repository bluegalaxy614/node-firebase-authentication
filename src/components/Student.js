import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newBirthday, setNewBirthday] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newFile, setNewFile] = useState(null);
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

    fetchData();
  }, [location.state]);

  // Handle form submission to add a new student
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle image upload if a file is selected
    if (selectedFile) {
      const storageRef = ref(storage, `images/${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addStudent(downloadURL); // Add student with image URL
          console.log(downloadURL);
        }
      );
    } else {
      await addStudent(); // Add student without image
    }
  };

  const addStudent = async (imageURL = "") => {
    try {
      await addDoc(collection(db, "students"), {
        name,
        age,
        birthday,
        gender,
        image: imageURL,
      });
      setName("");
      setAge("");
      setBirthday("");
      setGender("");
      setSelectedFile(null);
      setProgress(0);
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

      // Update student data without the image first
      await updateDoc(studentDoc, {
        name: newName,
        age: newAge,
        birthday: newBirthday,
        gender: newGender,
      });

      // If a new file is selected, handle the file upload
      if (newFile) {
        const storageRef = ref(storage, `images/${newFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.log(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            saveFileMetadata(id, downloadURL); // Save the file URL to Firestore
          }
        );
      }

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

  const saveFileMetadata = async (id, downloadURL) => {
    try {
      const studentDoc = doc(db, "students", id);
      await updateDoc(studentDoc, {
        image: downloadURL,
      });
    } catch (error) {
      console.error("Error saving file metadata: ", error);
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
      style={{ padding: "20px", margin: "10px auto" }}
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
          required
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
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <p>Upload progress: {progress}%</p>
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
              <th>Image</th>
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
                  <img
                    src={student.image ? student.image : "https://via.placeholder.com/50x50"}
                    alt={student.name}
                    style={{ width: "50px", height: "50px" }}
                  />
                </td>
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
                    <>
                      <input
                        type="file"
                        onChange={(e) => setNewFile(e.target.files[0])}
                      />
                      <button onClick={() => handleUpdate(student.id)}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <FaEdit onClick={() => handleEdit(student)} />
                      <FaTrash onClick={() => handleDelete(student.id)} />
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
