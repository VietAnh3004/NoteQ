import { useState } from 'react';
import tokenManager from '../storage';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function SignIn() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        tokenManager.setToken(data.accessToken);
        
        console.log('Token saved:', data.accessToken);
        setMessage('Đăng nhập thành công!');
        setIsLoggedIn(true);
        // Điều hướng theo role
        const decoded = jwtDecode(data.accessToken);
        console.log('Decoded token:', decoded);
        if (decoded.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }

        // Reset form
        setFormData({ username: '', password: '', confirmPassword: '' });
      } else {
        setMessage(data.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      setMessage('Lỗi kết nối: ' + error.message);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setMessage('');

    // Kiểm tra password confirmation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp!');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đăng ký thành công! Hãy đăng nhập.');
        setIsLogin(true);
        // Reset form
        setFormData({ username: '', password: '', confirmPassword: '' });
      } else {
        setMessage(data.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      setMessage('Lỗi kết nối: ' + error.message);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    tokenManager.clearToken();
    setIsLoggedIn(false);
    setMessage('Đã đăng xuất!');
  };

  const checkToken = () => {
    const token = tokenManager.getToken();
    alert(`Current token: ${token || 'No token found'}`);
  };

  // Nếu đã đăng nhập, hiển thị dashboard
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng!</h2>
            <p className="text-gray-600 mb-6">Bạn đã đăng nhập thành công</p>
            
            <div className="space-y-3">
              <button
                onClick={checkToken}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Kiểm tra Token
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Chào mừng bạn trở lại!' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              placeholder="Nhập mật khẩu"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('thành công') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={isLogin ? handleLogin : handleSignup}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              isLogin ? 'Đăng nhập' : 'Đăng ký'
            )}
          </button>
        </div>

        {/* Toggle Form */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
                setFormData({ username: '', password: '', confirmPassword: '' });
              }}
              className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
            
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;