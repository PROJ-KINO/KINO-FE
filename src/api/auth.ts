import axios from "./axiosInstance";

export const useAuthApi = () => {
  const login = async (provider: string) => {
    return await axios.get(`/auth/login/${provider}`);
  };

  const loginWithKakao = async (code: string) => {
    return await axios.get(`auth/oauth/kakao?code=${code}`);
  };
  const loginWithGoogle = async (code: string) => {
    return await axios.get(`auth/oauth/google?code=${code}`);
  };
  const loginWithNaver = async (code: string) => {
    return await axios.get(`auth/oauth/naver?code=${code}`);
  };

  const userInfoGet = async () => {
    return await axios.get("/user");
  };

  const logout = async () => {
    return await axios.get("/logout");
  };

  const reissue = async () => {
    return await axios.get("/refresh");
  };

  return {
    login,
    loginWithKakao,
    loginWithGoogle,
    loginWithNaver,
    userInfoGet,
    logout,
    reissue,
  };
};
export default useAuthApi;
