import profileIconWhite from "../assets/img/profileIconWhite.png";
import profileIcon from "../assets/img/profileIcon.png";

export interface Theme {
  backgroundColor: string;
  textColor: string;
  modalTextColor: string;
  hoverColor: string;
  profileImg: string;
}

export const lightTheme = {
  backgroundColor: "#ffffff",
  textColor: "#000000",
  modalTextColor: "#555",
  hoverColor: "#d9d9d9",
  profileImg: profileIcon,
};

export const darkTheme = {
  // backgroundColor: "#000000",
  backgroundColor: "#141414",
  textColor: "#ffffff",
  modalTextColor: "#d9d9d9",
  hoverColor: "#212529",
  profileImg: profileIconWhite,
};
