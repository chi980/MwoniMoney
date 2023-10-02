import React from "react";
import styled from "styled-components";
import { Category } from "./ChallengeCategory";
import { Text } from "../About/AboutText";

//recoil
import { getChallenge } from "../../../states/ChallengeState";
import { userDataState } from "../../../states/UserInfoState";
import { useRecoilState } from "recoil";
import { isButtonChallenge } from "../../../states/ChallengeState";

//axios
import { api } from "../../../apis/Api";

//router
import { useNavigate } from "react-router-dom";

export const ChallengeListContainer = styled.div`
  // border: 1px solid black;
  width: 100%;
  height: 55%;
  overflow-y: auto; /* 세로 스크롤만 생성 */
  overflow-x: hidden; /* 가로 스크롤 제거 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 5%;
`;

export const ListComponent = styled.div`
  // 그림자
  // box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
  // border: 1px solid red;
  background-color: #ffffff;
  width: 90%;
  height: 30%;
  border-top-left-radius: 4% 4%;
  border-top-right-radius: 4% 4%;
  border-bottom-left-radius: 4% 4%;
  border-bottom-right-radius: 4% 4%;
  margin-bottom: 5%;
`;

export const ListTitle = styled.div`
  // border: 1px solid black;
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  margin-left: 3%;
`;

export const Title = styled.div`
  // border: 1px solid black;
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-weight: bold;
  font-size: 1.5em;
`;
export const CategoryTag = styled.div`
  // border: 1px solid black;
  width: 20%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const DeadLine = styled.div`
  // border: 1px solid black;
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 10%;
`;

export const ListBtn = styled.div`
  // border: 1px solid black;
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

interface BtnProps {
  backcolor: string;
}

const ChallengeBtn = styled.div<BtnProps>`
  // 그림자
  // box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
  width: 35%;
  height: 70%;
  border-radius: 5%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-weight: bold;
  background-color: ${(props) => props.backcolor};
`;
interface Props {
  data: getChallenge;
}

function ChallengeList({ data }: Props) {
  const navigate = useNavigate();

  const formatDate = (origindate: string) => {
    const date = new Date(origindate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 1을 더하고 2자리로 포맷팅
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formattedDate = formatDate(data.endTime);

  const [userData, setUserData] = useRecoilState(userDataState);
  const role = userData.memberRole;

  //자식의 memberChallengeidx
  const memberChallengeIdx = data.memberChallengeIdx;

  //챌린지 리스트의 버튼이 클릭되어있는지
  const [isButtonState, setIsButtonState] = useRecoilState(isButtonChallenge);

  const handleAccept = () => {
    api
      .patch(`/v1/challenges/${memberChallengeIdx}/accept`)
      .then((response) => {
        console.log("부모 챌린지 수락");
        setIsButtonState(true);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data === "로그인 되어있지 않습니다.") {
          navigate("/LoginPage");
        }
      });
  };
  const handleReject = () => {
    api
      .patch(`/v1/challenges/${memberChallengeIdx}/reject`)
      .then((response) => {
        console.log("부모 챌린지 거절");
        setIsButtonState(true);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data === "로그인 되어있지 않습니다.") {
          navigate("/LoginPage");
        }
      });
  };
  const handleComplete = () => {
    if (role === "PARENT") {
      //부모 완료 api
      api
        .patch(`/v1/challenges/${memberChallengeIdx}`)
        .then((response) => {
          console.log("부모 챌린지 완료 요청 완료 처리");
          setIsButtonState(true);
        })
        .catch((error) => {
          console.log(error);
          if (error.response.data === "로그인 되어있지 않습니다.") {
            navigate("/LoginPage");
          }
        });
    } else {
      //자식 완료 요청 api
      api
        .patch(`/v1/challenges/propose/${memberChallengeIdx}`)
        .then((response) => {
          console.log("자식 : 챌린지 완료 요청 완료 처리");
          setIsButtonState(true);
        })
        .catch((error) => {
          if (error.response.data === "로그인 되어있지 않습니다.") {
            navigate("/LoginPage");
          } else if (error.response.data === "챌린지 기록이 없습니다.") {
            alert("이미 지워진 챌린지입니다.");
            window.location.reload();
          } else {
            console.log(error);
          }
        });
    }
  };
  const handleDelete = () => {
    api
      .delete(`/v1/challenges/${memberChallengeIdx}`)
      .then((response) => {
        console.log("챌린지 삭제");
        setIsButtonState(true);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data === "로그인 되어있지 않습니다.") {
          navigate("/LoginPage");
        }
      });
  };

  return (
    <ListComponent>
      <ListTitle>
        <Title>{data.memo}</Title>
        <CategoryTag>
          {data.status === 0 && (
            <Category backcolor="#fcdf92" width="80%">
              <Text fontsize="0.7rem" marginL="0%" fontweight="700">
                진행중
              </Text>
            </Category>
          )}
          {data.status === 1 && (
            <Category backcolor="#d1d1d1" width="80%">
              <Text fontsize="0.7rem" marginL="0%" fontweight="700">
                완료대기
              </Text>
            </Category>
          )}
          {data.status === 2 && (
            <Category backcolor="#d1d1d1" width="80%">
              <Text fontsize="0.7rem" marginL="0%" fontweight="700">
                제안대기
              </Text>
            </Category>
          )}
          {data.status === 3 && (
            <Category backcolor="#B9DEB3" width="80%">
              <Text fontsize="0.7rem" marginL="0%" fontweight="700">
                완료
              </Text>
            </Category>
          )}
          {data.status === 4 && (
            <Category backcolor="#FFA27E" width="80%">
              <Text fontsize="0.7rem" marginL="0%" fontweight="700">
                거절
              </Text>
            </Category>
          )}
          {data.status === 5 && (
            <Category backcolor="#656565" width="80%">
              <Text
                color="white"
                fontsize="0.7rem"
                marginL="0%"
                fontweight="700"
              >
                만료
              </Text>
            </Category>
          )}
        </CategoryTag>
        <DeadLine> {formattedDate}</DeadLine>
      </ListTitle>

      {/* {role === "CHILD" ? ( */}
      {role === "PARENT" ? (
        //PARENT
        <>
          {(data.status === 0 ||
            data.status === 3 ||
            data.status === 4 ||
            data.status === 5) && (
            <ListBtn style={{ justifyContent: "flex-end" }}>
              <ChallengeBtn
                backcolor="#f4f4f4"
                onClick={handleDelete}
                style={{ margin: "0% 7% 0% 0%" }}
              >
                삭제
              </ChallengeBtn>
            </ListBtn>
          )}
          {data.status === 1 && (
            <ListBtn style={{ justifyContent: "flex-end" }}>
              <ChallengeBtn
                backcolor="#fbd56e"
                onClick={handleComplete}
                style={{ margin: "0% 7% 0% 0%" }}
              >
                완료
              </ChallengeBtn>
            </ListBtn>
          )}
          {data.status === 2 && (
            <ListBtn>
              <ChallengeBtn backcolor="#fbd56e" onClick={handleAccept}>
                수락
              </ChallengeBtn>
              <ChallengeBtn backcolor="#f4f4f4" onClick={handleReject}>
                거절
              </ChallengeBtn>
            </ListBtn>
          )}
        </>
      ) : (
        //CHILD
        <ListBtn style={{ justifyContent: "flex-end" }}>
          {data.status === 0 && (
            <ChallengeBtn
              backcolor="#fbd56e"
              onClick={handleComplete}
              style={{ margin: "0% 7% 0% 0%" }}
            >
              완료
            </ChallengeBtn>
          )}
        </ListBtn>
      )}
    </ListComponent>
  );
}

export default ChallengeList;
