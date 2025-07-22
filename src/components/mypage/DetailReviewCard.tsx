import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { ko, se } from "date-fns/locale";
import ReportModal from "../ReportModal";
import parse from "html-react-parser";
import useReviewsApi from "../../api/reviews";
import { useTranslation } from "react-i18next";

interface DetailReview {
  reviewId: number;
  image: string;
  userId: number;
  userProfile: string;
  userNickname: string;
  title: string;
  content: string;
  isMine: boolean;
  likeCount: number;
  totalViews: number;
  commentCount: number;
  createdAt: string;
}

interface DetailReviewCardProps {
  review: DetailReview;
  isMine?: boolean;
  showProfile?: boolean;
  movieTitle?: string;
  isMobile?: boolean;
  onClick?: () => void;
  onDelete?: (revieId: number) => void;
}

// --- 공통 스타일드 컴포넌트 ---
interface styleType {
  $ismobile?: boolean;
  $showProfile?: boolean;
}

const CardBase = styled.div<styleType>`
  background-color: ${({ theme }) =>
    theme.backgroundColor === "#ffffff" ? "#d9d9d9" : "#333"};
  border-radius: 8px;
  padding: ${(props) => (props.$ismobile ? "15px" : "25px")};
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    transform: translateY(-3px);
  }
`;

const ReviewText = styled.div<styleType>`
  margin: 0;
  font-size: ${(props) => (props.$ismobile ? "0.7em" : "1em")};
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  /* min-height: ${(props) => (props.$ismobile ? "5vh" : "2vh")}; */

  img {
    max-width: 100%;
    max-height: ${(props) => (props.$ismobile ? "100px" : "200px")};
    object-fit: cover;
    border-radius: 8px;
    height: auto;
    display: block;
  }
`;

const MetaInfo = styled.div<styleType>`
  font-size: ${(props) => (props.$ismobile ? "0.7em" : "1em")};
  color: #888;
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$ismobile ? "3px" : "7px")};
`;

const Heart = styled.img<styleType>`
  width: ${(props) => (props.$ismobile ? "16px" : "20px")};
  height: ${(props) => (props.$ismobile ? "16px" : "20px")};
  object-fit: cover;
`;

const LikesDisplay = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const CommentImage = styled.img<styleType>`
  width: ${(props) => (props.$ismobile ? "16px" : "20px")};
  height: ${(props) => (props.$ismobile ? "16px" : "20px")};
  object-fit: cover;
  margin-left: 5px;
`;

const CommentDisplay = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  margin-right: 5px;
`;

const ThreeDotsMenu = styled.button`
  background: none;
  margin-left: auto;
  border: none;
  color: #888;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 5px;
  &:hover {
    color: #555;
  }
`;

// --- DetailReviewCard 컴포넌트 고유 스타일 ---
const DetailReviewCardContainer = styled(CardBase)<styleType>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${(props) => (props.$ismobile ? "10px" : "20px")};
  padding-right: ${(props) => (props.$ismobile ? "15px" : "25px")};
`;

// 사용자 프로필 스타일
const UserProfile = styled.div<styleType>`
  margin-bottom: ${(props) => (props.$ismobile ? "10px" : "20px")};
  display: flex;
  align-items: center;
`;

const UserImage = styled.img<styleType>`
  width: ${(props) => (props.$ismobile ? "28px" : "50px")};
  height: ${(props) => (props.$ismobile ? "28px" : "50px")};
  border: 2px solid #fd6782;
  object-fit: cover;
  border-radius: 50%;
  &:hover {
    border: 3px solid #f73c63;
  }
`;

const UserText = styled.div<styleType>`
  display: flex;
  flex-direction: column;
  margin-left: ${(props) => (props.$ismobile ? "10px" : "10px")};
`;

const UserNickname = styled.div<styleType>`
  font-weight: bold;
  font-size: ${(props) => (props.$ismobile ? "14px" : "18px")};
`;

// 리뷰 스타일
const ContentWrapper = styled.div<styleType>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: ${(props) =>
    props.$ismobile
      ? "auto"
      : "calc(100% - 150px - 20px)"}; /* 이미지 너비(150px) + gap(20px) */
`;

// const DetailMoviePoster = styled.img<styleType>`
//     width: ${(props) => (props.$ismobile ? "80px" : "150px")};
//     height: ${(props) => (props.$ismobile ? "110px" : "220px")};
//     object-fit: cover;
//     border-radius: 4px;
//     flex-shrink: 0;
// `;

const DetailReviewContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const DetailReviewTitleText = styled.h4<styleType>`
  font-size: ${(props) => (props.$ismobile ? "0.9em" : "1.2em")};
  margin-bottom: ${(props) => (props.$ismobile ? "5px" : "10px")};
  margin-top: 0;
  padding: 0 10px;
`;

const DetailReviewMovieTitleText = styled.p`
  color: #555;
  font-size: 0.85em;
  margin: 0 0 8px;
  padding: 0 10px;
`;

const DetailReviewFooter = styled.div<styleType>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: ${(props) => (props.$ismobile ? "10px" : "20px")};
  border-top: 1px solid #cccccc;
  padding: 10px 10px 0 10px;
`;

const PopMenu = styled.ul<styleType>`
  position: absolute;
  right: 0;
  top: 25px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 8px 0;
  z-index: 10;
  min-width: 90px;
  list-style: none;
  margin: 0;
`;

const MenuItem = styled.li<styleType>`
  padding: 8px 12px;
  font-size: ${(props) => (props.$ismobile ? "0.8em" : "0.9em")};
  color: #333;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const MenuItemReport = styled(MenuItem)`
  color: #fd6782;
  &:hover {
    background: #fce7ed;
    color: #fd6782;
  }
`;

const DetailReviewCard: React.FC<DetailReviewCardProps> = ({
  review,
  isMine,
  showProfile,
  movieTitle,
  isMobile,
  onClick,
  onDelete,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const popMenuRef = useRef<HTMLUListElement | null>(null);
  const { deleteReview, postReviewReport } = useReviewsApi();
  const [reportedReviewId, setReportedReviewId] = useState<number>(0);
  const [reporteeId, setReporteeId] = useState<number>(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };
  const [isReportOpen, setIsReportOpen] = useState(false);
  const handleReportClick = () => {
    setReportedReviewId(review.reviewId);
    setReporteeId(review.userId);
    setIsReportOpen(true);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popMenuRef.current &&
        !popMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const deletePost = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    try {
      const res = deleteReview(review.reviewId);
      res.then((data) => {
        console.log("게시글 삭제 성공:", data.data);
        onDelete?.(review.reviewId);
        // 모달 처리
        // alert("게시글이 삭제되었습니다.");
        navigate("/community"); // 목록 페이지로 이동
      });
    } catch (e) {
      console.error("게시글 삭제 실패:", e);
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const submitReport = async (type: number, content: string) => {
    try {
      const res = postReviewReport(type, content, reportedReviewId, reporteeId);
      res.then(() => {
        console.log("리뷰 신고 성공");
        // 완료 모달
        // alert("리뷰가 신고되었습니다.");
        setIsReportOpen(false);
      });
    } catch (error) {
      console.error("리뷰 신고 실패:", error);
      // 에러 모달
      alert("리뷰 신고에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <DetailReviewCardContainer $ismobile={isMobile} onClick={onClick}>
        {/* <DetailMoviePoster
          $ismobile={isMobile}
          src={review.image}
          alt={review.title || "리뷰 첨부 이미지"}
        /> */}
        <ContentWrapper $ismobile={isMobile}>
          {showProfile && (
            <UserProfile $ismobile={isMobile}>
              <UserImage
                $ismobile={isMobile}
                src={review.userProfile}
                alt={review.userNickname}
              />
              <UserText $ismobile={isMobile}>
                <UserNickname $ismobile={isMobile}>
                  {review.userNickname}
                </UserNickname>
              </UserText>
            </UserProfile>
          )}
          <DetailReviewContentWrapper>
            <DetailReviewTitleText $ismobile={isMobile}>
              {review.title}
            </DetailReviewTitleText>
            {movieTitle && (
              <DetailReviewMovieTitleText>
                영화: {movieTitle}
              </DetailReviewMovieTitleText>
            )}
            <ReviewText $ismobile={isMobile}>
              {parse(review.content)}
            </ReviewText>
            <DetailReviewFooter $ismobile={isMobile}>
              <MetaInfo $ismobile={isMobile}>
                <Heart
                  src="https://img.icons8.com/?size=100&id=V4c6yYlvXtzy&format=png&color=000000"
                  alt="좋아요"
                  $ismobile={isMobile}
                ></Heart>
                <LikesDisplay>{review.likeCount}</LikesDisplay>
                <CommentImage
                  src={
                    theme.backgroundColor === "#141414"
                      ? "https://img.icons8.com/?size=100&id=11167&format=png&color=FFFFFF"
                      : "https://img.icons8.com/?size=100&id=61f1pL4hEqO1&format=png&color=000000"
                  }
                  alt="댓글"
                  $ismobile={isMobile}
                ></CommentImage>
                <CommentDisplay>{review.commentCount}</CommentDisplay>
              </MetaInfo>
            </DetailReviewFooter>
          </DetailReviewContentWrapper>
        </ContentWrapper>
        <ThreeDotsMenu
          style={{ alignSelf: "flex-start", position: "relative" }}
          onClick={handleMenuClick}
        >
          ⋮
          {menuOpen && (
            <PopMenu
              ref={popMenuRef}
              $ismobile={isMobile}
              onClick={(e) => e.stopPropagation()}
            >
              {isMine ? (
                <>
                  <MenuItem
                    $ismobile={isMobile}
                    onClick={(e) => {
                      if (!e) {
                        alert("undefined 이벤트!");
                        return;
                      }
                      e.stopPropagation();
                      console.log("수정 클릭");
                      navigate(`/community/edit/${review.reviewId}`);
                      console.log("수정 페이지로 이동");
                    }}
                  >
                    {t("edit")}
                  </MenuItem>
                  <MenuItem
                    $ismobile={isMobile}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePost();
                      setMenuOpen(false);
                    }}
                  >
                    {t("delete")}
                  </MenuItem>
                </>
              ) : (
                <MenuItemReport
                  $ismobile={isMobile}
                  onClick={() => {
                    handleReportClick(); /* 신고 함수 */
                  }}
                >
                  {t("report")}
                </MenuItemReport>
              )}
            </PopMenu>
          )}
        </ThreeDotsMenu>
      </DetailReviewCardContainer>
      {isReportOpen && (
        <ReportModal
          setIsModalOpen={setIsReportOpen}
          onSubmit={({ type, content }) => {
            submitReport(type, content);
          }}
        ></ReportModal>
      )}
    </>
  );
};

export default DetailReviewCard;
