import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Token management (giả sử đã có admin token từ login)

import tokenManager from '../storage'; // Import token manager


function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentView, setCurrentView] = useState('users'); // 'users', 'notes', 'note-detail'
  const navigate = useNavigate();
  // API headers với JWT token
  const getHeaders = () => {
    const token = tokenManager.getToken();
    
    if (!token) {
      console.error('No token available for request');
      navigate('/signin');
      throw new Error('Authentication required');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all users
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/user-list?page=${page}&pageSize=10&order=ASC`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (err) {
      setError('Không thể tải danh sách users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes of a specific user
  const fetchUserNotes = async (accId, page = 1) => {
    setLoading(true);
    setError('');
    try {
      // Giả sử có API để lấy notes của user cụ thể
      // Hoặc có thể thêm query param account_id vào API notes
      const response = await fetch(
        `http://localhost:8080/api/notes?account_id=${accId}&page=${page}&pageSize=10&order=DESC&type=created_at`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user notes');
      }

      const data = await response.json();
      setUserNotes(data.data || []);
    } catch (err) {
      setError('Không thể tải notes của user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch note by ID
  const fetchNoteById = async (noteId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch note');
      }

      const note = await response.json();
      setSelectedNote(note);
    } catch (err) {
      setError('Không thể tải chi tiết note: ' + err.message);
    }
  };

  // Delete user
  const deleteUser = async (accountId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này? Tất cả notes của user cũng sẽ bị xóa.')) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/delete-account', {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ account_id: accountId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Quay về trang danh sách users và refresh
      setCurrentView('users');
      setSelectedUser(null);
      setUserNotes([]);
      setSelectedNote(null);
      fetchUsers(currentPage);
    } catch (err) {
      setError('Không thể xóa user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa note này?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      // Refresh danh sách notes của user
      fetchUserNotes(selectedUser.account_id);
      setSelectedNote(null);
      setCurrentView('notes');
    } catch (err) {
      setError('Không thể xóa note: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Handle user click
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setCurrentView('notes');
    fetchUserNotes(user.account_id);
  };

  // Handle note click
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setCurrentView('note-detail');
    fetchNoteById(note.note_id);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Breadcrumb navigation
  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <button
        onClick={() => {
          setCurrentView('users');
          setSelectedUser(null);
          setSelectedNote(null);
        }}
        className={`hover:text-blue-600 ${currentView === 'users' ? 'text-blue-600 font-medium' : ''}`}
      >
        Danh sách Users
      </button>
      {selectedUser && (
        <>
          <span>/</span>
          <button
            onClick={() => {
              setCurrentView('notes');
              setSelectedNote(null);
            }}
            className={`hover:text-blue-600 ${currentView === 'notes' ? 'text-blue-600 font-medium' : ''}`}
          >
            Notes của {selectedUser.username}
          </button>
        </>
      )}
      {selectedNote && (
        <>
          <span>/</span>
          <span className="text-blue-600 font-medium">Chi tiết Note</span>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Breadcrumb */}
        {renderBreadcrumb()}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Users List View */}
        {currentView === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Danh sách Users</h2>
              <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tải...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p>Không có users nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.account_id}
                      onClick={() => handleUserClick(user)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{user.username}</h3>
                          <p className="text-sm text-gray-500">ID: {user.account_id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Notes View */}
        {currentView === 'notes' && selectedUser && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Notes của {selectedUser.username}
                  </h2>
                  <p className="text-gray-600 mt-1">User ID: {selectedUser.account_id}</p>
                </div>
                <button
                  onClick={() => deleteUser(selectedUser.account_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa User
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tải notes...</p>
                </div>
              ) : userNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>User này chưa có notes nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userNotes.map((note) => (
                    <div
                      key={note.note_id}
                      onClick={() => handleNoteClick(note)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition duration-200"
                    >
                      <h3 className="font-medium text-gray-800 truncate mb-2">
                        {note.header || 'Không có tiêu đề'}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {note.content || 'Không có nội dung'}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Độ quan trọng: {note.importance_rate}/5</span>
                        <span>{formatDate(note.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note Detail View */}
        {currentView === 'note-detail' && selectedNote && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedNote.header || 'Không có tiêu đề'}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Tạo: {formatDate(selectedNote.created_at)}</span>
                    {selectedNote.updated_at && selectedNote.updated_at !== selectedNote.created_at && (
                      <span>Cập nhật: {formatDate(selectedNote.updated_at)}</span>
                    )}
                    <span>Độ quan trọng: {selectedNote.importance_rate}/5</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNote(selectedNote.note_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa Note
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedNote.content || 'Không có nội dung'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;