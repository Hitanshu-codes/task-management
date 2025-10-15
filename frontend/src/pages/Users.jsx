import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { Plus, Search, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Users = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getUsers({ search: searchTerm });
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (selectedUser) {
                await userAPI.updateUser(selectedUser._id, data);
                toast.success('User updated successfully');
                setShowEditModal(false);
            } else {
                await userAPI.createUser(data);
                toast.success('User created successfully');
                setShowCreateModal(false);
            }
            reset();
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (userToEdit) => {
        setSelectedUser(userToEdit);
        setValue('email', userToEdit.email);
        setValue('role', userToEdit.role);
        setShowEditModal(true);
    };

    const handleDelete = async (userId) => {
        if (userId === user._id) {
            toast.error('You cannot delete yourself');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userAPI.deleteUser(userId);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const UserModal = ({ isOpen, onClose, title }) => (
        isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">{title}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                type="email"
                                className="input"
                                placeholder="user@example.com"
                            />
                        </div>

                        {!selectedUser && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    {...register('password', {
                                        required: selectedUser ? false : 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    })}
                                    type="password"
                                    className="input"
                                    placeholder="Enter password"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select {...register('role')} className="input">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex space-x-3">
                            <button type="submit" className="btn btn-primary flex-1">
                                {selectedUser ? 'Update' : 'Create'}
                            </button>
                            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <UserPlus className="h-5 w-5" />
                    <span>Add User</span>
                </button>
            </div>

            <div className="card p-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {users.map(userItem => (
                    <div key={userItem._id} className="card p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <UserMinus className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{userItem.email}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${userItem.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {userItem.role}
                                        </span>
                                        {userItem._id === user._id && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(userItem)}
                                    className="btn btn-secondary text-sm"
                                >
                                    Edit
                                </button>
                                {userItem._id !== user._id && (
                                    <button
                                        onClick={() => handleDelete(userItem._id)}
                                        className="btn btn-danger text-sm"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="text-center py-12">
                        <UserMinus className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new user.</p>
                    </div>
                )}
            </div>

            <UserModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    reset();
                }}
                title="Add New User"
            />

            <UserModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    reset();
                }}
                title="Edit User"
            />
        </div>
    );
};

