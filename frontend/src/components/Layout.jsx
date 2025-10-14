import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Home } from 'lucide-react';

export const Layout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <Home className="h-6 w-6 text-primary-600" />
                                <span className="text-xl font-bold text-gray-900">TaskManager</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                                Dashboard
                            </Link>
                            {isAdmin && (
                                <Link to="/users" className="text-gray-700 hover:text-primary-600">
                                    Users
                                </Link>
                            )}
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-700">{user?.email}</span>
                                {isAdmin && (
                                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};
