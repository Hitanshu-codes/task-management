import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI, userAPI } from '../services/api';
import { Plus, Search, Filter, Calendar, User, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [filters]);

    const fetchTasks = async () => {
        try {
            const response = await taskAPI.getTasks(filters);
            setTasks(response.data.tasks);
        } catch (error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getUsersList();
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
        }
    };

    const onSubmit = async (data) => {
        try {
            if (selectedTask) {
                await taskAPI.updateTask(selectedTask._id, data);
                toast.success('Task updated successfully');
                setShowEditModal(false);
            } else {
                await taskAPI.createTask(data);
                toast.success('Task created successfully');
                setShowCreateModal(false);
            }
            reset();
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save task');
        }
    };

    const handleEdit = (task) => {
        setSelectedTask(task);
        setValue('title', task.title);
        setValue('description', task.description);
        setValue('dueDate', new Date(task.dueDate).toISOString().split('T')[0]);
        setValue('assignedTo', task.assignedTo._id);
        setValue('priority', task.priority);
        setValue('status', task.status);
        setShowEditModal(true);
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskAPI.deleteTask(taskId);
                toast.success('Task deleted successfully');
                fetchTasks();
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const downloadAttachment = async (taskId, attachmentId, filename) => {
        try {
            const response = await taskAPI.downloadAttachment(taskId, attachmentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const TaskModal = ({ isOpen, onClose, title }) => (
        isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">{title}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                {...register('title', { required: 'Title is required' })}
                                className="input"
                                placeholder="Task title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                {...register('description', { required: 'Description is required' })}
                                className="input"
                                rows="3"
                                placeholder="Task description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                {...register('dueDate', { required: 'Due date is required' })}
                                type="date"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assign To</label>
                            <select {...register('assignedTo', { required: 'Assignee is required' })} className="input">
                                <option value="">Select user</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>{user.email}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <select {...register('priority')} className="input">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select {...register('status')} className="input">
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attachments (PDF only)</label>
                            <input
                                {...register('attachments')}
                                type="file"
                                multiple
                                accept=".pdf"
                                className="input"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button type="submit" className="btn btn-primary flex-1">
                                {selectedTask ? 'Update' : 'Create'}
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
                <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Task</span>
                </button>
            </div>

            <div className="card p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input pl-10"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="input"
                    >
                        <option value="">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-6">
                {tasks.map(task => (
                    <div key={task._id} className="card p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                <p className="text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                    {task.status.replace('-', ' ')}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Assigned to: {task.assignedTo.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span>Created by: {task.createdBy.email}</span>
                            </div>
                        </div>

                        {task.attachments && task.attachments.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {task.attachments.map((attachment, index) => (
                                        <button
                                            key={index}
                                            onClick={() => downloadAttachment(task._id, attachment._id, attachment.originalName)}
                                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>{attachment.originalName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleEdit(task)}
                                className="btn btn-secondary text-sm"
                            >
                                Edit
                            </button>
                            {(isAdmin || task.createdBy._id === user._id) && (
                                <button
                                    onClick={() => handleDelete(task._id)}
                                    className="btn btn-danger text-sm"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    reset();
                }}
                title="Create New Task"
            />

            <TaskModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                    reset();
                }}
                title="Edit Task"
            />
        </div>
    );
};
