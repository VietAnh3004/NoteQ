// Token management với closure
const createTokenManager = () => {
  let accessToken = null;
  
  return {
    setToken: (token) => {
      accessToken = token;
      console.log('Token saved:', token);
    },
    getToken: () => accessToken,
    clearToken: () => {
      accessToken = null;
      console.log('Token cleared');
    },
    hasToken: () => !!accessToken
  };
};

// Tạo instance global cho token manager
const tokenManager = createTokenManager();

export default tokenManager;