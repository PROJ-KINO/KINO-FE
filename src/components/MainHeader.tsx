import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import logoText from "../assets/img/LogoTxt.png";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import useAuthApi from "../api/auth";
import MainConfirmDialog from "./MainConfirmDialog";
import profileIconWhite from "../assets/img/profileIconWhite.png";
import logoutIcon from "../assets/img/LogoutIcon.png";

interface styleType {
  $ismobile: boolean;
}

interface headerType {
  $ismobile: boolean;
  $ispopupopen: boolean;
  $ismenupopupopen: boolean;
}
interface userImageType extends styleType {
  $image: string;
}
interface HeaderProps {
  keyword: string;
  setKeyword: (value: string) => void;
  setIsNewUser: (value: boolean) => void;
}

const HeaderContainer = styled.header<headerType>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  /* background-color: ${({ theme }) => theme.backgroundColor}; */
  background: ${({ $ispopupopen, $ismenupopupopen }) =>
    $ispopupopen || $ismenupopupopen
      ? "black"
      : `linear-gradient(
          to bottom,
          rgba(0, 0, 0, 1) 0%,
          rgba(0, 0, 0, 0.7) 50%,
          rgba(0, 0, 0, 0) 100%
        )`};
  /* color: ${({ theme }) => theme.textColor}; */
  color: white;
  /* backdrop-filter: blur(8px); */
  position: fixed;
  top: 0;
  z-index: 3000;
`;

const HeaderMenuContainer = styled.div<styleType>`
  display: flex;
  align-items: center;
  width: 70%;
  height: 100%;
`;

const HeaderMenuBtn = styled.button<styleType>`
  text-align: center;
  /* background-color: ${({ theme }) => theme.backgroundColor}; */
  background-color: transparent;
  /* color: ${({ theme }) => theme.textColor}; */
  color: white;
  position: relative;
  height: 100%;
  min-width: 8%;
  padding: 10px;
  margin-right: 15px;
  margin-left: ${(props) => (props.$ismobile ? "3px" : null)};
  font-size: ${(props) => (props.$ismobile ? "10px" : "14px")};
  font-weight: 400;
  border: none;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
  }
  transition: 0.1s ease-in;
`;

const UserInfoContainer = styled.div<styleType>`
  display: flex;
  width: 30%;
  min-width: 12%;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  margin-right: ${(props) => (props.$ismobile ? "20px" : "40px")};
`;

const Logo = styled.img<styleType>`
  width: ${(props) => (props.$ismobile ? "80px" : "100px")};
  margin-left: ${(props) => (props.$ismobile ? "20px" : "30px")};
  cursor: pointer;
`;

const UserImageContainer = styled.div<userImageType>`
  width: ${(props) => (props.$ismobile ? "30px" : "35px")};
  height: ${(props) => (props.$ismobile ? "30px" : "35px")};
  border-radius: 10%;
  background-color: grey;
  margin-left: 15px;
  background-image: ${(props) => `url(${props.$image})`};
  background-position: center;
  background-size: cover;
  cursor: pointer;
`;

const HeaderText = styled.span<styleType>`
  font-size: ${(props) => (props.$ismobile ? "12px" : "14px")};
  /* color: ${({ theme }) => theme.textColor}; */
  color: white;
`;

const LoginBtn = styled.button<styleType>`
  width: auto;
  height: 30px;
  background-color: transparent;
  padding: 0px 5px;
  font-size: ${(props) => (props.$ismobile ? "12px" : "14px")};
  border: none;
  /* color: ${({ theme }) => theme.textColor}; */
  color: white;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
  }
  transition: transform 0.2s ease-in-out;
`;

const Popup = styled(motion.div)<styleType>`
  width: ${(props) => (props.$ismobile ? "130px" : "150px")};
  height: ${(props) => (props.$ismobile ? "100px" : "120px")};
  border-radius: 14px;
  /* background-color: ${({ theme }) => theme.backgroundColor}; */
  background-color: rgba(0, 0, 0, 0.8);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  right: ${(props) => (props.$ismobile ? "10px" : "34px")};
  z-index: 3000;
  top: ${(props) => (props.$ismobile ? "48px" : "50px")};
`;

const PopupBtn = styled.button<styleType>`
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: ${({ theme }) => theme.backgroundColor}; */
  background-color: transparent;
  color: white;
  font-size: ${(props) => (props.$ismobile ? "10px" : "14px")};
  /* color: ${({ theme }) => theme.textColor}; */
  width: 80%;
  height: 50px;
  cursor: pointer;
  border: none;
  &:hover {
    transform: scale(1.1);
  }
  transition: transform 0.2s ease-in-out;
`;

const PopupImg = styled.img<{ $width: string; $mr: string }>`
  width: ${(props) => props.$width};
  margin-right: ${(props) => props.$mr};
`;

const MenuPopup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 60px;
  left: 0px;
  width: 200px;
  height: 200px;
  /* background-color: ${({ theme }) => theme.backgroundColor}; */
  background-color: rgba(0, 0, 0, 0.7);
  border-bottom-right-radius: 15px;
  opacity: 50%;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
`;

const MenuPopupText = styled.span<{ $ismenupopupopen: boolean }>`
  font-size: 7px;
  text-align: center;
  margin-left: 4px;
  display: inline-block;
  transform: rotate(${(props) => (props.$ismenupopupopen ? "180deg" : "0deg")});
  transition: transform 0.4s ease;
  font-family: sans-serif;
`;
interface UserType {
  userId: number;
  nickname: string;
  image: string;
  email: string;
  isFirstLogin: boolean;
}

const MainHeader = ({ keyword, setKeyword, setIsNewUser }: HeaderProps) => {
  const [user, setUser] = useState<UserType>({
    userId: 0,
    nickname: "",
    image: "",
    email: "",
    isFirstLogin: false,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const menuPopupRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const { userInfoGet, logout } = useAuthApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuItems = [
    { label: "홈", path: "/" },
    { label: "커뮤니티", path: "/community" },
    { label: "영화", path: "/movie" },
    { label: "내가 찜한 리스트", path: "/wish" },
  ];

  const handlePopup = () => {
    setIsPopupOpen((prev) => !prev);
    setIsMenuPopupOpen(false);
  };

  const handleMenuPopup = (path: string) => {
    setIsMenuPopupOpen((prev) => !prev);
    console.log("메뉴 팝업", isMenuPopupOpen);
    setIsPopupOpen(false);
    navigate(`${path}`);
  };

  const onClickMypage = () => {
    setIsPopupOpen(false);
    navigate("/mypage");
  };

  const onClickLogout = async () => {
    try {
      await logout();
    } finally {
      setIsModalOpen(true);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPopupOpen && !isMenuPopupOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isPopupOpen &&
        popupRef.current &&
        !popupRef.current.contains(target) &&
        imageRef.current &&
        !imageRef.current.contains(target)
      ) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen, isMenuPopupOpen]);

  useEffect(() => {
    const userDataGet = async () => {
      const res = await userInfoGet();
      setUser(res.data.data);
    };
    userDataGet();
    setIsNewUser(user.isFirstLogin);
  }, []);

  return (
    <>
      <HeaderContainer
        $ismobile={isMobile}
        $ispopupopen={isPopupOpen}
        $ismenupopupopen={isMenuPopupOpen}
      >
        <Logo
          $ismobile={isMobile}
          src={logoText}
          alt="로고 이미지"
          onClick={() => navigate("/")}
        />
        <HeaderMenuContainer $ismobile={isMobile}>
          {isMobile ? (
            <>
              <HeaderMenuBtn
                $ismobile={isMobile}
                onClick={() => {
                  setIsMenuPopupOpen((prev) => !prev);
                }}
              >
                메뉴
                <MenuPopupText $ismenupopupopen={isMenuPopupOpen}>
                  ▼
                </MenuPopupText>
              </HeaderMenuBtn>
              {isMenuPopupOpen && (
                <MenuPopup
                  ref={menuPopupRef}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {menuItems.map(({ label, path }) => (
                    <HeaderMenuBtn
                      key={path}
                      $ismobile={isMobile}
                      style={{ width: "100%" }}
                      onClick={() => handleMenuPopup(path)}
                    >
                      {label}
                    </HeaderMenuBtn>
                  ))}
                </MenuPopup>
              )}
            </>
          ) : (
            <>
              {menuItems.map(({ label, path }) => (
                <HeaderMenuBtn
                  key={path}
                  $ismobile={isMobile}
                  onClick={() => handleMenuPopup(path)}
                >
                  {label}
                </HeaderMenuBtn>
              ))}
            </>
          )}
        </HeaderMenuContainer>

        <UserInfoContainer $ismobile={isMobile}>
          {!isMobile && <SearchBar keyword={keyword} setKeyword={setKeyword} />}

          {user.nickname === "" ? (
            <LoginBtn $ismobile={isMobile} onClick={() => navigate("/login")}>
              {isMobile ? "로그인" : "로그인하러 가기"}
            </LoginBtn>
          ) : (
            <>
              <HeaderText $ismobile={isMobile}>{user.nickname}</HeaderText>
              <UserImageContainer
                ref={imageRef}
                $ismobile={isMobile}
                $image={user.image ? user.image : profileIconWhite}
                onClick={handlePopup}
              />
            </>
          )}
        </UserInfoContainer>
      </HeaderContainer>
      {isPopupOpen && (
        <Popup
          $ismobile={isMobile}
          ref={popupRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PopupBtn onClick={onClickMypage} $ismobile={isMobile}>
            <PopupImg src={profileIconWhite} $width="20px" $mr="5px" />
            마이페이지
          </PopupBtn>
          <PopupBtn onClick={onClickLogout} $ismobile={isMobile}>
            <PopupImg src={logoutIcon} $width="15px" $mr="10px" />
            로그아웃
          </PopupBtn>
        </Popup>
      )}
      <MainConfirmDialog
        isOpen={isModalOpen}
        title="알림"
        message={"로그아웃 되었습니다!"}
        onConfirm={() => {
          navigate("/login");
        }}
        showCancel={false}
        isRedButton={true}
      />
    </>
  );
};

export default MainHeader;
