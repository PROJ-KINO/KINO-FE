import "./App.css";
import Header from "./components/Header";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { darkTheme, lightTheme } from "./styles/theme";
import { ThemeProvider } from "styled-components";
import MyPageMain from "./pages/mypage/MyPageMain";
import MyReviewsShortPage from "./pages/mypage/MyReviewsShortPage";
import MyReviewsDetailPage from "./pages/mypage/MyReviewsDetailPage";
import MyFavoriteMoviesPage from "./pages/mypage/MyFavoriteMoviesPage";
import MySettingsPage from "./pages/mypage/MySettingsPage";
import MyTagsPage from "./pages/mypage/MyTagsPage";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Movie from "./pages/Movie";
import MovieDetail from "./pages/MovieDetail";
import { usePreferMode } from "./hooks/usePreferMode";
import GlobalStyle from "./styles/GlobalStyle";
import Admin from "./pages/Admin";
import KakaoCallback from "./components/KakaoCallback";
import GoogleCallback from "./components/GoogleCallback";
import NaverCallback from "./components/NaverCallback";
import CommunityCreatePage from "./pages/community/CommunityCreatePage";
import CommunityDetailPage from "./pages/community/CommunityDetailPage";
import CommunityListPage from "./pages/community/CommunityListPage";
import { DialogProvider, useDialog } from "./context/DialogContext";
import ConfirmDialog from "./components/ConfirmDialog";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";

const HeaderSelector = ({ path }: { path: string }) => {
  if (path === "/Login" || path === "/login") return null;
  if (path === "/") return null;

  return <Header />;
};

const GlobalDialogRenderer = () => {
  const { dialog, closeDialog } = useDialog();

  return (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      title={dialog.title || ""}
      message={dialog.message}
      showCancel={dialog.showCancel}
      isRedButton={dialog.isRedButton}
      onConfirm={dialog.onConfirm ?? (() => {})}
      onCancel={() => closeDialog()}
    />
  );
};

const AppContents = () => {
  const isDarkMode = usePreferMode();
  const location = useLocation();
  const path = location.pathname;
  const isAdminPage = path === "/admin";
  const { openDialog, closeDialog } = useDialog();
  const errorTimeoutRef = useRef<number | null>(null);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  useEffect(() => {
    const handler = (e: Event) => {
      const code = (e as CustomEvent).detail?.status || 401;
      if (code === 500) {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => {
          openDialog({
            title: "서버에 문제가 발생했습니다",
            message: isMobile
              ? "잠시 후 다시 시도해주세요."
              : "일시적인 문제일 수 있으니 잠시 후 다시 시도해주세요.",
            showCancel: false,
            isRedButton: true,
            onConfirm: () => closeDialog(),
          });
        }, 1000);
      }
      if (code === 401) {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => {
          openDialog({
            title: "인증 시간이 만료되었습니다.",
            message: "다시 로그인 해주세요.",
            showCancel: false,
            isRedButton: true,
            onConfirm: () => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
              closeDialog();
            },
          });
        }, 1000);
      }
    };
    window.addEventListener("unauthorized", handler);

    return () => {
      window.removeEventListener("unauthorized", handler);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [openDialog, closeDialog]);
  return (
    <>
      <ThemeProvider
        theme={isAdminPage ? lightTheme : isDarkMode ? darkTheme : lightTheme}
      >
        <GlobalStyle />
        <HeaderSelector path={path} />
        <Routes>
          <Route path="/" element={<Main />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/api/auth/oauth/kakao" element={<KakaoCallback />} />
          <Route path="/api/auth/oauth/google" element={<GoogleCallback />} />
          <Route path="/api/auth/oauth/naver" element={<NaverCallback />} />

          <Route path="/movie" element={<Movie />}></Route>
          <Route path="/movie/:id" element={<MovieDetail />}></Route>

          <Route path="/admin" element={<Admin />}></Route>

          <Route path="/mypage" element={<MyPageMain />} />
          <Route
            path="/mypage/reviews/short"
            element={<MyReviewsShortPage />}
          />
          <Route
            path="/mypage/reviews/detail"
            element={<MyReviewsDetailPage />}
          />
          <Route
            path="/mypage/movies/favorite"
            element={<MyFavoriteMoviesPage />}
          />
          <Route path="/mypage/settings" element={<MySettingsPage />} />
          <Route path="/mypage/tags" element={<MyTagsPage />} />

          <Route path="/comnmuniy" element={<CommunityListPage />} />
          <Route path="/community/:id" element={<CommunityDetailPage />} />
          <Route path="/community/new" element={<CommunityCreatePage />} />
          <Route path="/community/edit/:id" element={<CommunityCreatePage />} />
        </Routes>
        <GlobalDialogRenderer />
      </ThemeProvider>
    </>
  );
};

function App() {
  return (
    <DialogProvider>
      <BrowserRouter>
        <AppContents />
      </BrowserRouter>
    </DialogProvider>
  );
}

export default App;
