import styled from "styled-components";
import bgImg from "../assets/img/backgroundImg.png";
import logo from "../assets/img/Logo.png";
import kakao from "../assets/img/kakaoBtn.png";
import naver from "../assets/img/naverBtn.png";
import google from "../assets/img/googleBtn.png";
import { useMediaQuery } from "react-responsive";
import useAuthApi from "../api/auth";

interface styleProp {
  $ismobile: boolean;
}

const LoginContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
  background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 1) 100%
    ),
    url(${bgImg});
  background-position: center;
  background-size: cover;
  filter: brightness(1.1);
`;

const Logo = styled.img<styleProp>`
  width: ${(props) => (props.$ismobile ? "190px" : "300px")};
  margin-top: ${(props) => (props.$ismobile ? "210px" : "13%")};
  margin-bottom: ${(props) => (props.$ismobile ? "30px" : "60px")};
`;

const LoginBtn = styled.img<styleProp>`
  width: 200px;
  margin-top: 10px;
  cursor: pointer;
  &:hover {
    filter: brightness(0.9);
  }
`;

const Login = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const loginButtons = [
    { src: naver, alt: "naver", value: "naver" },
    { src: kakao, alt: "kakao", value: "kakao" },
    { src: google, alt: "google", value: "google" },
  ];
  const { login } = useAuthApi();
  const handleLogin = async (provider: string) => {
    try {
      const res = await login(provider);
      console.log("로그인", res);
    } catch (error: any) {
      const redirectUri =
        error?.response?.data?.redirectUri || error?.response?.data?.data;
      if (redirectUri) {
        window.location.href = redirectUri;
      } else {
        console.error("로그인", error);
      }
    }
  };
  return (
    <>
      <LoginContainer>
        <Logo src={logo} $ismobile={isMobile} />
        {loginButtons.map((btn, idx) => (
          <LoginBtn
            key={idx}
            src={btn.src}
            alt={`${btn.alt}`}
            $ismobile={isMobile}
            onClick={() => handleLogin(btn.value)}
          />
        ))}
      </LoginContainer>
    </>
  );
};

export default Login;
