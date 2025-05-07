// src/pages/EditUserRoles.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditUserRoles.css';
import { getUser, updateUser } from '../services/userService'; //  Import the API calls

const EditUserRoles = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const navigate = useNavigate();

  const allRoles = ['customer', 'staff'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(userId); //  Use the actual API call
        setUser(userData);
        setSelectedRoles(userData.role);
      } catch (err) {
        setError('Failed to fetch user details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleRoleChange = (role) => {
    setSelectedRoles(prevRoles =>
      prevRoles.includes(role) ? prevRoles.filter(r => r !== role) : [...prevRoles, role]
    );
  };

  const handleSave = async () => {
    try {
      await updateUser(userId, { role: selectedRoles }); //  Use the actual API call
      alert('User roles updated.');
      navigate('/admin/users');
    } catch (err) {
      setError('Failed to update user roles.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="edit-user-roles-container">
        <h2>Edit Roles for {user.firstName} {user.lastName}</h2>
        {/* <div className="role-options">
            {allRoles.map(role => (
                <label key={role} className="role-label">
                    <input
                        type="checkbox"
                        value={role}
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleRoleChange(role)}
                    />
                    {role}
                </label>
            ))}
        </div> */}
        <div className="edit-user-roles-actions">
            <button onClick={handleSave} className="save-roles-btn">Save Roles</button>
            <button onClick={() => navigate('/admin/users')} className="cancel-roles-btn">Cancel</button>
        </div>
    </div>
);
};

export default EditUserRoles;