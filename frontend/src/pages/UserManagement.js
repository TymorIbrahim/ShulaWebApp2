// src/pages/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css'; // Create a CSS file for styling
import { getUsers, deleteUser } from '../services/userService'; //  Import the API calls

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers(); //  Use the actual API call
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEditRole = (userId) => {
    navigate(`/admin/users/${userId}/edit-roles`);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId); //  Use the actual API call
      setUsers(users.filter(user => user._id !== userId));
      alert('User deleted.');
    } catch (err) {
      setError('Failed to delete user.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-management-container">
        <h2>User Management</h2>
        <table className="user-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user._id} className="user-row">
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{Array.isArray(user.role) ? user.role.join(', ') : 'None'}</td>  {/* Safe role display */}
                        <td>
                            <button onClick={() => handleEditRole(user._id)} className="edit-role-btn">Edit Roles</button>
                            <button onClick={() => handleDeleteUser(user._id)} className="delete-user-btn">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
};

export default UserManagement;