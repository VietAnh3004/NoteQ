import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Token management (giả sử đã có token từ login)
import tokenManager from '../storage'; // Import token manager

function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Form state - ĐÃ SỬA: title -> header
  const [formData, setFormData] = useState({
    header: '',  // Đổi từ title thành header
    content: '',
    importance_rate: 1
  });

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

  // Fetch all notes
  const fetchNotes = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:8080/api/notes?page=${page}&pageSize=10&order=DESC&type=created_at`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (err) {
      setError('Không thể tải danh sách notes: ' + err.message);
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

  // Create new note
  const createNote = async () => {
    setLoading(true);
    try {
      console.log('Creating note with data:', formData); // Debug log
      
      const response = await fetch('http://localhost:8080/api/notes', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      setIsCreateFormOpen(false);
      setFormData({ header: '', content: '', importance_rate: 1 }); // Đổi title -> header
      fetchNotes(currentPage);
    } catch (err) {
      setError('Không thể tạo note: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update note
  const updateNote = async () => {
    setLoading(true);
    try {
      console.log('Updating note with data:', formData); // Debug log
      
      const response = await fetch(`http://localhost:8080/api/notes/${selectedNote.note_id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      setIsEditMode(false);
      setFormData({ header: '', content: '', importance_rate: 1 }); // Đổi title -> header
      fetchNotes(currentPage);
      fetchNoteById(selectedNote.note_id);
    } catch (err) {
      setError('Không thể cập nhật note: ' + err.message);
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

      setSelectedNote(null);
      fetchNotes(currentPage);
    } catch (err) {
      setError('Không thể xóa note: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const token = tokenManager.getToken();
    if (!token) {
      console.error('No token found, redirecting to login...');
      navigate('/signin');
      return;
    }
    fetchNotes(currentPage);
  }, [currentPage, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'importance_rate' ? parseInt(value) : value
    }));
  };

  // Handle note click
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    fetchNoteById(note.note_id);
  };

  // Handle edit button click - ĐÃ SỬA: title -> header
  const handleEditClick = () => {
    setFormData({
      header: selectedNote.header || selectedNote.title || '', // Fallback cho cả header và title
      content: selectedNote.content || '',
      importance_rate: selectedNote.importance_rate || 1
    });
    setIsEditMode(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Note Q</h1>
            <button
              onClick={() => setIsCreateFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Note
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Danh sách Notes</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tải...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Chưa có notes nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.note_id}
                      onClick={() => handleNoteClick(note)}
                      className={`p-3 border rounded-lg cursor-pointer transition duration-200 hover:bg-gray-50 ${
                        selectedNote?.note_id === note.note_id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <h3 className="font-medium text-gray-800 truncate">
                        {note.header || note.title || 'Không có tiêu đề'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {note.content || 'Không có nội dung'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span>Độ quan trọng: {note.importance_rate}/5</span>
                        <span>{formatDate(note.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
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

          {/* Note Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {selectedNote ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedNote.header || selectedNote.title || 'Không có tiêu đề'}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Tạo: {formatDate(selectedNote.created_at)}</span>
                        {selectedNote.updated_at && selectedNote.updated_at !== selectedNote.created_at && (
                          <span>Cập nhật: {formatDate(selectedNote.updated_at)}</span>
                        )}
                        <span>Độ quan trọng: {selectedNote.importance_rate}/5</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditClick}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.note_id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedNote.content || 'Không có nội dung'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg">Chọn một note để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Note Modal */}
      {(isCreateFormOpen || isEditMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? 'Sửa Note' : 'Tạo Note Mới'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  name="header"
                  value={formData.header}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề note"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập nội dung note"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ quan trọng (1-5)
                </label>
                <select
                  name="importance_rate"
                  value={formData.importance_rate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateFormOpen(false);
                  setIsEditMode(false);
                  setFormData({ header: '', content: '', importance_rate: 1 });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition duration-200"
              >
                Hủy
              </button>
              <button
                onClick={isEditMode ? updateNote : createNote}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Tạo Note')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;