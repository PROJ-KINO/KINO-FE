import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMediaQuery } from "react-responsive";
import styled from "styled-components";
import {
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  SwipeAction,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { useFormatDate } from "../../hooks/useFormatDate";
import AdminConfirmDialog from "../../components/admin/AdminConfirmDialog";
import useAdminApi from "../../api/admin";

interface User {
  id: number;
  nickname: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Report {
  reportId: number;
  reporterEmail: string;
  reportedEmail: string;
  reportedRole: string;
  reportedDate: string;
}

interface StyleProps {
  $ismobile: boolean;
}
interface PageType {
  currentPage: number;
  size: number;
  pageContentAmount: number;
}
interface adminProps {
  selectedOption: string;
  isConfirmBtnPrs: boolean;
  setIsModalOpen: (value: boolean) => void;
  setIsConfirmBtnprs: (value: boolean) => void;
  setSelectedReportId: (value: number) => void;
  setPageInfo: Dispatch<SetStateAction<PageType>>;
  pageInfo: PageType;
}

const TableContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const Table = styled.table`
  width: 100%;
  height: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  border-bottom: 1px solid #d9d9d9;
  height: 45px;
`;

const Td = styled.td`
  border-bottom: 1px solid #eee;
  /* height: 48.4px; */
  height: 6.1vh;
  text-align: center;
  /* background-color: blue; */
`;

const Status = styled.span<{ $status: string; $ismobile: boolean }>`
  color: ${({ $status }) =>
    $status === "정상" ? "green" : $status === "정지" ? "red" : "blue"};
  font-weight: 700;
  font-size: ${(props) => (props.$ismobile ? "12px" : "15px")};
`;

const ManageBtn = styled.button<StyleProps>`
  background-color: ${(props) => (props.$ismobile ? "red" : "#f06292")};
  color: white;
  font-weight: 600;
  padding-bottom: 3px;
  border: none;
  border-radius: 4px;
  width: ${(props) => (props.$ismobile ? "70px" : "100px")};
  height: ${(props) => (props.$ismobile ? "100%" : "30px")};
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    background-color: #5f5d5d;
    cursor: not-allowed;
  }
`;

const CheckBox = styled.input`
  margin-left: 20px;
`;

const MobileAdminList = styled.div`
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 8px;
`;

const MobileContainer = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  width: 300px;
  /* background-color: ${({ theme }) => theme.backgroundColor}; */
  /* color: ${({ theme }) => theme.textColor}; */
  color: black;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

const MobileInfoContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const CustomSwipeableListItem = styled(SwipeableListItem)`
  margin-top: 15px;
`;

const MobileTitleTxt = styled.span`
  font-weight: 700;
  font-size: 12px;
`;

const MobileContentTxt = styled.span`
  font-size: 12px;
`;

const AdminList = ({
  selectedOption,
  setIsModalOpen,
  setSelectedReportId,
  isConfirmBtnPrs,
  setIsConfirmBtnprs,
  pageInfo,
  setPageInfo,
}: adminProps) => {
  const [selectedUser, setSelectedUser] = useState<number[]>([]);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmModalOk, setIsConfirmModalOk] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [reportDatas, setReportDatas] = useState<Report[]>([]);
  const [selectedUserForDialog, setSelectedUserForDialog] = useState<User>({
    id: 0,
    nickname: "",
    email: "",
    role: "",
    createdAt: "",
  });

  const {
    userGet,
    reviewReportGet,
    shortReviewReportGet,
    commentReportGet,
    userActivePost,
  } = useAdminApi();
  const [selectedOnly, setSelectedOnly] = useState(0);

  // const selectAllUser = () => {
  //   if (selectedUser.length === users.length) {
  //     setSelectedUser([]);
  //   } else {
  //     setSelectedUser(users.map((user) => user.id));
  //   }
  // };

  const bannedIds = users
    .filter((user) => user.role === "BAN_USER")
    .map((user) => user.id);

  const isAllBannedChecked =
    bannedIds.length > 0 &&
    bannedIds.every((id) => selectedUser.includes(id)) &&
    selectedUser.length === bannedIds.length;

  const selectAllUser = () => {
    if (isAllBannedChecked) {
      setSelectedUser([]);
    } else {
      setSelectedUser(bannedIds);
    }
  };
  const selectUser = (userId: number, userStatus: string) => {
    if (userStatus === "USER" || userStatus === "ADMIN") return;
    setSelectedUser((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const [revokedUsers, setRevokedUsers] = useState<number[]>([]);
  const handleRevoke = (userId: number) => {
    if (!revokedUsers.includes(userId)) {
      setRevokedUsers((prev) => [...prev, userId]);
    }
  };

  const hiddenDeleteSection = (userId: number, userRole: string) => (
    <TrailingActions>
      <SwipeAction
        onClick={async () => {
          handleRevoke(userId);
          // selectUser(userId, userRole);
          // console.log("안녕하세유", selectedUser);
          // usersActive();
          const res = await userActivePost([userId]);
        }}
        destructive={true}
      >
        <ManageBtn $ismobile={isMobile}>철회</ManageBtn>
      </SwipeAction>
    </TrailingActions>
  );

  const listGet = () => {
    if (selectedOption === "회원관리") {
      const fetchData = async () => {
        try {
          const res = await userGet(pageInfo.currentPage, pageInfo.size);
          setUsers(res.data.data.content);
          setPageInfo((prev) => ({
            ...prev,
            pageContentAmount: res.data.data.totalPages,
          }));
        } catch (error) {
          console.error("사용자 조회 실패:", error);
        }
      };
      fetchData();
    }
    if (selectedOption === "게시글") {
      const fetchData = async () => {
        try {
          const res = await reviewReportGet(
            pageInfo.currentPage,
            pageInfo.size
          );
          console.log("게시글 신고 내역", res.data.data);
          setReportDatas(res.data.data.content);
          console.log("토탈 페이지 ", res.data.data.totalPages);
          setPageInfo((prev) => ({
            ...prev,
            pageContentAmount: res.data.data.totalPages,
          }));
        } catch (error) {
          console.log("게시글 신고 실패:", error);
        }
      };
      fetchData();
    }
    if (selectedOption === "한줄평") {
      const fetchData = async () => {
        try {
          const res = await shortReviewReportGet(
            pageInfo.currentPage,
            pageInfo.size
          );
          console.log("한줄평 신고 내역", res.data.data);
          setReportDatas(res.data.data.content);
          setPageInfo((prev) => ({
            ...prev,
            pageContentAmount: res.data.data.totalPages,
          }));
        } catch (error) {
          console.log("한줄평 신고 실패:", error);
        }
      };
      fetchData();
    }
    if (selectedOption === "댓글") {
      const fetchData = async () => {
        try {
          const res = await commentReportGet(
            pageInfo.currentPage,
            pageInfo.size
          );
          console.log("댓글 신고 내역", res.data.data);
          setReportDatas(res.data.data.content);
          setPageInfo((prev) => ({
            ...prev,
            pageContentAmount: res.data.data.totalPages,
          }));
        } catch (error) {
          console.log("댓글 신고 실패:", error);
        }
      };
      fetchData();
    }
  };

  const usersActive = async () => {
    const res = await userActivePost(selectedUser);
    setSelectedUser([]);
    listGet();
  };

  const userActive = async () => {
    const res = await userActivePost([selectedOnly]);
    setSelectedUser([]);
    listGet();
  };

  // useEffect(() => {
  //   listGet();
  // }, [isConfirmBtnPrs]);

  useEffect(() => {
    listGet();
  }, [selectedOption]);

  useEffect(() => {
    listGet();
  }, [pageInfo.currentPage]);

  useEffect(() => {
    if (isConfirmBtnPrs) {
      listGet();
      setIsConfirmBtnprs(false);
    }
  }, [isConfirmBtnPrs]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [mobilePage, setMobilePage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const mobileListGet = useCallback(async () => {
    try {
      if (selectedOption === "회원관리") {
        const res = await userGet(mobilePage, 12);
        setUsers((prev) => {
          const ids = new Set(prev.map((u) => u.id));
          const newItems = res.data.data.content.filter(
            (u: User) => !ids.has(u.id)
          );
          return [...prev, ...newItems];
        });
        const totalPages = res.data.data.totalPages;
        setHasMore(mobilePage + 1 < totalPages);
      }
      if (selectedOption === "게시글") {
        const res = await reviewReportGet(mobilePage, 12);
        setReportDatas((prev) => {
          const ids = new Set(prev.map((d) => d.reportId));
          const newItems = res.data.data.content.filter(
            (d: Report) => !ids.has(d.reportId)
          );
          return [...prev, ...newItems];
        });
        const totalPages = res.data.data.totalPages;
        setHasMore(mobilePage + 1 < totalPages);
      }
      if (selectedOption === "한줄평") {
        const res = await shortReviewReportGet(mobilePage, 12);
        setReportDatas((prev) => {
          const ids = new Set(prev.map((d) => d.reportId));
          const newItems = res.data.data.content.filter(
            (d: Report) => !ids.has(d.reportId)
          );
          return [...prev, ...newItems];
        });
        const totalPages = res.data.data.totalPages;
        setHasMore(mobilePage + 1 < totalPages);
      }
      if (selectedOption === "댓글") {
        const res = await commentReportGet(mobilePage, 12);
        setReportDatas((prev) => {
          const ids = new Set(prev.map((d) => d.reportId));
          const newItems = res.data.data.content.filter(
            (d: Report) => !ids.has(d.reportId)
          );
          return [...prev, ...newItems];
        });
        const totalPages = res.data.data.totalPages;
        setHasMore(mobilePage + 1 < totalPages);
      }
    } catch (err) {
      console.error("모바일 infinite load 실패:", err);
    }
  }, [selectedOption, mobilePage]);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (!isMobile) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setMobilePage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [hasMore, isMobile]
  );

  useEffect(() => {
    if (isMobile) {
      mobileListGet();
    }
  }, [mobilePage]);

  useEffect(() => {
    if (!isMobile) {
      listGet();
    } else {
      mobileListGet;
    }
  }, [selectedOption]);

  useEffect(() => {
    if (!isMobile) {
      setUsers([]);
      setReportDatas([]);
      listGet();
    }
    if (isMobile) {
      setUsers([]);
      setMobilePage(0);
      setReportDatas([]);
      mobileListGet();
    }
  }, [isMobile]);

  useEffect(() => {
    setSelectedUser([]);
  }, [pageInfo]);

  useEffect(() => {
    console.log(selectedUser);
  }, [selectedUser]);
  return (
    <>
      {selectedOption === "회원관리" ? (
        isMobile ? (
          <MobileAdminList>
            <SwipeableList threshold={0.25} fullSwipe={false}>
              {users.map((user, idx) => {
                const showSwipe =
                  selectedOption === "회원관리" && user.role === "BAN_USER";
                const isLast = idx === users.length - 1;
                return (
                  <CustomSwipeableListItem
                    key={user.id}
                    trailingActions={
                      showSwipe
                        ? hiddenDeleteSection(user.id, user.role)
                        : false
                    }
                  >
                    <div>
                      <MobileContainer ref={isLast ? lastElementRef : null}>
                        <MobileInfoContainer
                          onClick={() => {
                            selectedOption !== "회원관리"
                              ? setIsModalOpen(true)
                              : null;
                          }}
                        >
                          <div>
                            <MobileTitleTxt>닉네임 : </MobileTitleTxt>
                            <MobileContentTxt>{user.nickname}</MobileContentTxt>
                          </div>
                          <div>
                            <MobileTitleTxt>계정 : </MobileTitleTxt>
                            <MobileContentTxt>{user.email}</MobileContentTxt>
                          </div>
                          <div>
                            <MobileTitleTxt>회원상태 : </MobileTitleTxt>

                            <Status
                              $ismobile={isMobile}
                              $status={
                                user.role === "USER"
                                  ? "정상"
                                  : user.role === "BAN_USER"
                                  ? "정지"
                                  : "관리자"
                              }
                            >
                              {user.role === "USER"
                                ? "정상"
                                : user.role === "BAN_USER"
                                ? "정지"
                                : "관리자"}
                            </Status>
                          </div>
                          <div>
                            <MobileTitleTxt>가입일 : </MobileTitleTxt>
                            <MobileContentTxt>
                              {useFormatDate(user.createdAt)}
                            </MobileContentTxt>
                          </div>
                        </MobileInfoContainer>
                      </MobileContainer>
                    </div>
                  </CustomSwipeableListItem>
                );
              })}
            </SwipeableList>
          </MobileAdminList>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>
                    <CheckBox
                      type="checkbox"
                      checked={isAllBannedChecked}
                      onChange={selectAllUser}
                    />
                  </Th>
                  {selectedOption === "회원관리" ? (
                    <>
                      <Th>닉네임</Th>
                      <Th>계정</Th>
                      <Th>회원상태</Th>
                      <Th>가입일</Th>
                      <Th>
                        <ManageBtn
                          disabled={selectedUser.length === 0}
                          $ismobile={isMobile}
                          onClick={() => {
                            setIsConfirmModalOpen(true);
                          }}
                        >
                          정지 철회
                        </ManageBtn>
                      </Th>
                    </>
                  ) : (
                    <>
                      <Th>신고자</Th>
                      <Th>작성자</Th>
                      <Th>회원상태</Th>
                      <Th>신고일</Th>
                      <Th></Th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <Td>
                      <CheckBox
                        type="checkbox"
                        checked={selectedUser.includes(user.id)}
                        onChange={() => {
                          selectUser(user.id, user.role);
                          setSelectedUserForDialog(user);
                        }}
                      />
                    </Td>
                    <Td>{user.nickname}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Status
                        $ismobile={isMobile}
                        $status={
                          user.role === "USER"
                            ? "정상"
                            : user.role === "BAN_USER"
                            ? "정지"
                            : "관리자"
                        }
                      >
                        {user.role === "USER"
                          ? "정상"
                          : user.role === "BAN_USER"
                          ? "정지"
                          : "관리자"}
                      </Status>
                    </Td>
                    <Td>{useFormatDate(user.createdAt)}</Td>

                    <Td>
                      {user.role == "BAN_USER" && (
                        <ManageBtn
                          $ismobile={isMobile}
                          onClick={() => {
                            setIsConfirmModalOpen(true);
                            setSelectedUserForDialog(user);
                            // selectUser(user.id, user.role);
                            setSelectedOnly(user.id);
                            setSelectedUser([]);
                          }}
                        >
                          정지 철회
                        </ManageBtn>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )
      ) : isMobile ? (
        <MobileAdminList>
          <SwipeableList threshold={0.25} fullSwipe={false}>
            {reportDatas.map((data, idx) => {
              const isLast = idx === reportDatas.length - 1;
              return (
                <CustomSwipeableListItem
                  key={data.reportId}
                  trailingActions={false}
                >
                  <MobileContainer ref={isLast ? lastElementRef : null}>
                    <MobileInfoContainer
                      onClick={() => {
                        selectedOption !== "회원관리"
                          ? setIsModalOpen(true)
                          : null;
                        setSelectedReportId(data.reportId);
                      }}
                    >
                      <div>
                        <MobileTitleTxt>신고자 : </MobileTitleTxt>
                        <MobileContentTxt>
                          {data.reporterEmail}
                        </MobileContentTxt>
                      </div>
                      <div>
                        <MobileTitleTxt>작성자 : </MobileTitleTxt>
                        <MobileContentTxt>
                          {data.reportedEmail}
                        </MobileContentTxt>
                      </div>
                      <div>
                        <MobileTitleTxt>회원상태 : </MobileTitleTxt>

                        <Status
                          $ismobile={isMobile}
                          $status={
                            data.reportedRole === "USER"
                              ? "정상"
                              : data.reportedRole === "BAN_USER"
                              ? "정지"
                              : "관리자"
                          }
                        >
                          {data.reportedRole === "USER"
                            ? "정상"
                            : data.reportedRole === "BAN_USER"
                            ? "정지"
                            : "관리자"}
                        </Status>
                      </div>
                      <div>
                        <MobileTitleTxt>가입일 : </MobileTitleTxt>
                        <MobileContentTxt>
                          {useFormatDate(data.reportedDate)}
                        </MobileContentTxt>
                      </div>
                    </MobileInfoContainer>
                  </MobileContainer>
                </CustomSwipeableListItem>
              );
            })}
          </SwipeableList>
        </MobileAdminList>
      ) : (
        <TableContainer>
          {" "}
          <Table>
            <thead>
              <tr>
                <>
                  <Th>신고자</Th>
                  <Th>작성자</Th>
                  <Th>회원상태</Th>
                  <Th>신고일</Th>
                  <Th></Th>
                </>
              </tr>
            </thead>
            <tbody>
              {reportDatas.map((data) => (
                <tr key={data.reportId}>
                  <Td>{data.reporterEmail}</Td>
                  <Td>{data.reportedEmail}</Td>
                  <Td>
                    <Status
                      $ismobile={isMobile}
                      $status={
                        data.reportedRole === "USER"
                          ? "정상"
                          : data.reportedRole === "BAN_USER"
                          ? "정지"
                          : "관리자"
                      }
                    >
                      {data.reportedRole === "USER"
                        ? "정상"
                        : data.reportedRole === "BAN_USER"
                        ? "정지"
                        : "관리자"}
                    </Status>
                  </Td>
                  <Td>{useFormatDate(data.reportedDate)}</Td>

                  <Td>
                    <ManageBtn
                      $ismobile={isMobile}
                      onClick={() => {
                        setIsModalOpen(true);
                        setSelectedReportId(data.reportId);
                      }}
                    >
                      상세정보
                    </ManageBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
      <AdminConfirmDialog
        isOpen={isConfirmModalOpen}
        title="정지 철회"
        message={
          selectedUser.length > 1
            ? "선택된 회원들의 정지 상태를 철회하시겠습니까?"
            : `${selectedUserForDialog.nickname} 님을 철회하시겠습니까?`
        }
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          setIsConfirmModalOk(true);
          selectedUser.length === 0 ? userActive() : usersActive();
          listGet();
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
        }}
        showCancel={true}
        isRedButton={true}
      />
    </>
  );
};

export default AdminList;
