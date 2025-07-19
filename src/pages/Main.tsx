import styled from "styled-components";
import MainHeader from "../components/MainHeader";
import { useEffect, useState } from "react";
import SurveyModal from "../components/SurveyModal";
import useHomeApi from "../api/home";
import { useMediaQuery } from "react-responsive";
import logo from "../assets/img/Logo.png";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface styleType {
  $ismobile: boolean;
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
`;

const VideoContainer = styled.div<styleType>`
  width: 100%;
  height: ${(props) => (props.$ismobile ? " 30vh" : "80vh")};
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background-color: black;
`;

const Video = styled.iframe<styleType>`
  width: 100%;
  height: ${(props) => (props.$ismobile ? " 40vh" : "100vh")};
  object-fit: cover;
  border: none;
  outline: none;
  pointer-events: none;
`;

const ListContainer = styled.div<styleType>`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100vw;
  height: auto;
  top: ${(props) => (props.$ismobile ? "32vh" : " 77vh")};
  padding-top: 15px;
  overflow-x: hidden;
  background-color: #141414;
  margin-top: 10px;
  backdrop-filter: blur(2px);
  padding-bottom: 50px;
  z-index: 1000;
`;

const MovieContainer = styled.div`
  width: 100%;
  position: relative;
  right: 0px;
`;

const MoviesSlider = styled.div<styleType>`
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  padding-top: 15px;
  padding-bottom: 15px;
  padding-left: ${(props) => (props.$ismobile ? "30px" : "60px")};
  overflow-y: hidden;
`;

const Movies = styled(motion.div)<styleType>`
  display: inline-block;
  width: ${(props) => (props.$ismobile ? "180px" : "250px")};
  height: ${(props) => (props.$ismobile ? "110px" : "150px")};
  margin-right: 8px;
  background-color: transparent;
  text-align: center;
  line-height: 120px;
  position: relative;
  cursor: pointer;
  border-radius: 12px;
`;

const SkeletonBox = styled(motion.div)<styleType>`
  display: inline-block;
  width: ${(props) => (props.$ismobile ? "180px" : "250px")};
  height: ${(props) => (props.$ismobile ? "110px" : "150px")};
  margin-right: 8px;
  border-radius: 12px;
  background: linear-gradient(90deg, #222222 25%, #444444 50%, #222222 75%);
  background-size: 200% 100%;
`;
const VideoSkeletonBox = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  margin-top: 130px;
  border-radius: 24px;
  background: linear-gradient(90deg, #222222 25%, #444444 50%, #222222 75%);
  background-size: 200% 100%;
  z-index: 2;
`;

const SliderTypeTxt = styled.span<styleType>`
  font-size: ${(props) => (props.$ismobile ? "16px;" : "18px")};
  font-weight: 400;
  margin-top: 30px;
  padding-left: ${(props) => (props.$ismobile ? "30px" : "60px")};
  /* color: ${({ theme }) => theme.textColor}; */
  color: white;
`;

const VideoHiddenContainer = styled(motion.div)<{
  $image: string;
  $ismobile: boolean;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  margin-top: 100px;
  background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0) 100%
    ),
    url(${(props) => props.$image});
  background-position: center;
  background-size: cover;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
  margin-bottom: 100px;
  padding-left: ${(props) => (props.$ismobile ? "30px" : "140px")};
  font-size: 32;
  font-weight: bold;
  cursor: pointer;
`;

const Logo = styled.img<styleType>`
  width: ${(props) => (props.$ismobile ? "49px" : "80px")};
  margin-left: ${(props) => (props.$ismobile ? "8px" : "0px")};
  cursor: pointer;
  margin-top: ${(props) => (props.$ismobile ? "95px" : "100px")};
`;

const MoviePosterImg = styled.img`
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 12px;
`;
const TeaserTitleContainer = styled.div<styleType>`
  display: flex;
  align-items: center;
  padding-left: 20px;
  height: auto;
  font-size: ${(props) => (props.$ismobile ? "20px" : "40px")};
  margin-top: 10px;
`;

const TeaserExplainContainer = styled.div<styleType>`
  display: flex;
  align-items: center;
  padding-left: 20px;
  font-size: ${(props) => (props.$ismobile ? "11px" : "20px")};
  margin-top: ${(props) => (props.$ismobile ? "5px" : "20px")};
`;

const ModalContainer = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3000;
  width: 30vw;
  height: 30vh;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
`;
const ModalBox = styled(motion.div)`
  display: flex;
  width: 590px;
  /* height: 500px; */
  background-color: rgba(0, 0, 0, 0.7);
  border: 1.5px solid rgba(240, 98, 146, 0.4);
  border-radius: 20px;
  box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.53),
    0 0 0 2px rgba(229, 132, 165, 0.07);
  backdrop-filter: blur(12px) saturate(125%);
  padding: 38px 38px 34px 40px;
  gap: 36px;
  transition: box-shadow 0.22s cubic-bezier(0.44, 0.06, 0.36, 1);
`;

const MoviePoster = styled.img`
  width: 140px;
  min-width: 140px;
  max-width: 140px;
  height: 200px;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 8px 32px 0 rgba(240, 98, 146, 1), 0 2px 14px 0 rgba(0, 0, 0, 1);
  background: #19191b;
  margin-right: 8px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 3px;
  min-width: 0;
  width: 315px;
`;

const MovieTitle = styled.div`
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: 0.32px;
  color: #fff;
  word-break: keep-all;
`;

const MovieGenre = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-bottom: 3px;
`;

const GenreTag = styled.span`
  background: rgba(240, 98, 146, 0.18);
  border-radius: 50px;
  padding: 3px 13px 2px 13px;
  font-size: 16px;
  color: #f06292;
  font-weight: 700;
  letter-spacing: 0.16px;
  box-shadow: 0 2px 6px 0 rgba(240, 98, 146, 0.1);
  transition: background-color 0.18s;
  &:hover {
    background: rgba(240, 98, 146, 0.3);
  }
`;

const MoviePlot = styled.div`
  font-size: 16px;
  color: #eaeaea;
  line-height: 1.56;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: keep-all;
  margin-bottom: 8px;
`;

const MovieMeta = styled.div`
  font-size: 15px;
  color: #b6b6b6;
  display: flex;
  gap: 22px;
  align-items: center;
  margin-top: 3px;
`;

const MoreBtn = styled.button`
  background: linear-gradient(90deg, #f06292 60%, #ff9f80 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 22px;
  padding: 7px 23px;
  font-size: 17px;
  box-shadow: 0 3px 10px rgba(240, 98, 146, 0.11);
  cursor: pointer;
  margin-top: 16px;
  margin-left: auto;
  transition: filter 0.16s, transform 0.12s;
  &:hover {
    filter: brightness(94%);
    transform: scale(1.05);
  }
`;

interface TeaserType {
  movieId: number;
  title: string;
  teaserUrl: string;
  plot: string;
  stillCutUrl: string;
}

interface TopLikeReviewListType {
  reviewId: number;
  reviewTitle: string;
  content: string;
  movieId: number;
  movieTitle: string;
}

interface MovieList {
  title: string;
  movie_id: number;
  still_cut_url: string;
  poster_url: string;
  release_date: string;
  plot: string;
  running_time: number;
  genres: string[];
}

const Main = () => {
  const [keyword, setKeyword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const { getHomeApi, searchHomeApi } = useHomeApi();
  const navigate = useNavigate();
  const [isReviewLoading, setIsReviewLoading] = useState(true);
  const [isMovieLoading, setIsMovieLoading] = useState(true);

  const [teaser, setTeaser] = useState<TeaserType>({
    movieId: 0,
    title: "",
    teaserUrl: "",
    plot: "",
    stillCutUrl: "",
  });

  const [topLikeReviewList, setTopLikeReviewList] = useState<
    TopLikeReviewListType[]
  >([]);

  const [topPickMovieList, setTopPickMovieList] = useState<MovieList[]>([]);
  const [boxOfficeMovieList, setBoxOfficeMovieList] = useState<MovieList[]>([]);
  const [dailyTopMovieList, setDailyTopMovieList] = useState<MovieList[]>([]);
  const [monthlyTopMovieList, setMonthlyTopMovieList] = useState<MovieList[]>(
    []
  );
  const [recommendedMovieList, setRecommendedMovieList] = useState<MovieList[]>(
    []
  );

  const [searchedMovieList, setSearchedMovieList] = useState<MovieList[]>([]);

  const getHomeData = async () => {
    setIsReviewLoading(true);
    setIsMovieLoading(true);
    const res = await getHomeApi();

    setTeaser(res.data.data.teaser);
    setTopLikeReviewList(res.data.data.topLikeReviewList);
    setTopPickMovieList(res.data.data.topPickMovieList);
    setBoxOfficeMovieList(res.data.data.boxOfficeMovieList);
    setDailyTopMovieList(res.data.data.dailyTopMovieList);
    setMonthlyTopMovieList(res.data.data.monthlyTopMovieList);
    setRecommendedMovieList(res.data.data.recommendedMovieList || []);
    setIsReviewLoading(false);
    setIsMovieLoading(false);
  };

  const searchData = async () => {
    const res = await searchHomeApi(keyword);
    setSearchedMovieList(res.data.data);
  };

  useEffect(() => {
    getHomeData();
    console.log("새로운 유저인가 : ", isNewUser);
  }, []);

  useEffect(() => {
    searchData();
    console.log(searchedMovieList);
  }, [keyword]);

  useEffect(() => {
    if (teaser.stillCutUrl === "") {
      setShowIframe(false);
    }
  }, [teaser.stillCutUrl]);

  const reviewData = [{ prefix: "사용자 좋아요", highlight: "TOP 10 리뷰" }];
  const movieData = [
    { prefix: "사용자 좋아요", highlight: "TOP 10 영화" },
    { prefix: "현재 상영작 박스 오피스", highlight: "TOP 10 영화" },
    { prefix: "일별 조회수", highlight: "TOP 10 영화" },
    { prefix: "월별 조회수", highlight: "TOP 10 영화" },
    { prefix: "추천 TOP 10 영화", highlight: "" },
  ];

  const reviewLists = [topLikeReviewList];
  const movieLists = [
    topPickMovieList, // 사용자 좋아요 TOP 10 영화
    boxOfficeMovieList, // 박스 오피스 TOP 10 영화
    dailyTopMovieList, // 일별 조회수 TOP 10 영화
    monthlyTopMovieList, // 월별 조회수 TOP 10 영화
    recommendedMovieList, // 추천 TOP 10 영화 (필요하다면 추가)
  ];

  const [showIframe, setShowIframe] = useState(false);

  const [hoveredMovie, setHoveredMovie] = useState<MovieList | null>(null);
  useEffect(() => {
    console.log(hoveredMovie);
  }, [hoveredMovie]);

  useEffect(() => {
    if (hoveredMovie) {
      console.log("hoveredMovie.genre:", hoveredMovie);
    }
  }, [hoveredMovie]);
  return (
    <>
      {isNewUser && <SurveyModal setIsNewUser={setIsNewUser} />}
      <MainHeader
        keyword={keyword}
        setKeyword={setKeyword}
        setIsNewUser={setIsNewUser}
      />
      <MainContainer>
        <VideoContainer
          onMouseEnter={() => {
            if (teaser.stillCutUrl !== "") setShowIframe(true);
          }}
          onMouseLeave={() => {
            if (teaser.stillCutUrl !== "") setShowIframe(false);
          }}
          $ismobile={isMobile}
        >
          {showIframe && (
            <Video
              width="100%"
              height="100%"
              src={`${teaser.teaserUrl}`}
              title="Teaser"
              allow="accelerometer; autoplay; encrypted-media"
              allowFullScreen
              $ismobile={isMobile}
            />
          )}
          <AnimatePresence>
            {!showIframe &&
              (teaser.stillCutUrl ? (
                <VideoHiddenContainer
                  as={motion.div}
                  key="teaser"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.3 }}
                  $image={teaser.stillCutUrl}
                  $ismobile={isMobile}
                >
                  <Logo $ismobile={isMobile} src={logo} />
                  <TeaserTitleContainer $ismobile={isMobile}>
                    {teaser.title}
                  </TeaserTitleContainer>
                  <TeaserExplainContainer $ismobile={isMobile}>
                    {teaser.plot}
                  </TeaserExplainContainer>
                </VideoHiddenContainer>
              ) : (
                <VideoSkeletonBox
                  key="teaser-skeleton"
                  animate={{
                    backgroundPosition: ["200% 0", "-200% 0"],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
          </AnimatePresence>
        </VideoContainer>
        {keyword !== "" ? (
          searchedMovieList.length > 0 ? (
            <ListContainer $ismobile={isMobile}>
              <MovieContainer>
                <SliderTypeTxt $ismobile={isMobile}>
                  <span>검색 결과</span>
                </SliderTypeTxt>
                <MoviesSlider $ismobile={isMobile}>
                  {searchedMovieList.map((movie, i) => (
                    <Movies
                      $ismobile={isMobile}
                      key={movie.movie_id ?? i}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 30px 30px rgba(0,0,0,0.25)",
                        zIndex: 10,
                        borderRadius: "15px",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 18,
                      }}
                      onClick={() => {
                        navigate(`/movie/${movie.movie_id}`);
                      }}
                    >
                      <MoviePosterImg
                        src={movie.still_cut_url}
                        alt={movie.title}
                      />
                    </Movies>
                  ))}
                </MoviesSlider>
              </MovieContainer>
            </ListContainer>
          ) : (
            <ListContainer $ismobile={isMobile}>
              <MovieContainer>
                <SliderTypeTxt $ismobile={isMobile}>
                  <span>검색 결과가 없습니다.</span>
                </SliderTypeTxt>
              </MovieContainer>
            </ListContainer>
          )
        ) : (
          <ListContainer $ismobile={isMobile}>
            {reviewData.map(({ prefix, highlight }, idx) => (
              <MovieContainer key={idx}>
                <SliderTypeTxt $ismobile={isMobile}>
                  {prefix} <strong>{highlight}</strong>
                </SliderTypeTxt>
                <MoviesSlider $ismobile={isMobile}>
                  {isReviewLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <SkeletonBox
                        $ismobile={isMobile}
                        key={i}
                        animate={{
                          backgroundPosition: ["200% 0", "-200% 0"],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ))
                  ) : reviewLists[idx] && reviewLists[idx].length > 0 ? (
                    reviewLists[idx].map((review, i) => (
                      <Movies
                        $ismobile={isMobile}
                        key={review.reviewId ?? i}
                        style={{ backgroundColor: "gray" }}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 30px 30px rgba(0,0,0,0.25)",
                          zIndex: 10,
                          borderRadius: "15px",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 18,
                        }}
                      ></Movies>
                    ))
                  ) : (
                    <div>리뷰가 존재하지 않습니다.</div>
                  )}
                </MoviesSlider>
              </MovieContainer>
            ))}
            {movieData.map(({ prefix, highlight }, idx) => (
              <MovieContainer key={idx}>
                <SliderTypeTxt $ismobile={isMobile}>
                  {prefix} <strong>{highlight}</strong>
                </SliderTypeTxt>
                <MoviesSlider $ismobile={isMobile}>
                  {isMovieLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <SkeletonBox
                        $ismobile={isMobile}
                        key={i}
                        animate={{
                          backgroundPosition: ["200% 0", "-200% 0"],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ))
                  ) : movieLists[idx] && movieLists[idx].length > 0 ? (
                    movieLists[idx].map((movie) => (
                      <Movies
                        $ismobile={isMobile}
                        key={movie.movie_id}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 30px 30px rgba(0,0,0,0.25)",
                          zIndex: 10,
                          borderRadius: "15px",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 18,
                        }}
                        onClick={() => {
                          navigate(`/movie/${movie.movie_id}`);
                        }}
                        onMouseEnter={() => setHoveredMovie(movie)}
                        onMouseLeave={() => setHoveredMovie(null)}
                      >
                        <MoviePosterImg
                          src={movie.still_cut_url}
                          alt={movie.title}
                        />
                      </Movies>
                    ))
                  ) : (
                    <div>영화가 존재하지 않습니다.</div>
                  )}
                </MoviesSlider>
              </MovieContainer>
            ))}
          </ListContainer>
        )}
      </MainContainer>
      <AnimatePresence>
        {hoveredMovie && (
          <ModalContainer
            onMouseEnter={() => setHoveredMovie(hoveredMovie)}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <ModalBox
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{
                duration: 0.22,
                ease: [0.44, 0.06, 0.36, 1],
              }}
            >
              <MoviePoster
                src={hoveredMovie.poster_url}
                alt={hoveredMovie.title}
              />
              <InfoSection>
                <MovieTitle>{hoveredMovie.title}</MovieTitle>
                <MovieGenre>
                  {(Array.isArray(hoveredMovie.genres)
                    ? hoveredMovie.genres
                    : []
                  ).map((g: string, idx: number) => (
                    <GenreTag key={g + idx}>{g.trim()}</GenreTag>
                  ))}
                </MovieGenre>
                <MoviePlot>{hoveredMovie.plot}</MoviePlot>
                <MovieMeta>
                  <span>개봉일: {hoveredMovie.release_date}</span>
                  <span>러닝 타임: {hoveredMovie.running_time}분</span>
                </MovieMeta>
                <MoreBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/movie/${hoveredMovie.movie_id}`);
                  }}
                >
                  상세보기
                </MoreBtn>
              </InfoSection>
            </ModalBox>
          </ModalContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default Main;
