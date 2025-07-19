import React, { useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";

interface styleType {
  $ismobile: boolean;
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
`;

const Dialog = styled(motion.div)<styleType>`
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 12px;
  padding: 24px;
  width: ${(props) => (props.$ismobile ? "200px" : "360px")};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2<{ $hasMessage: boolean; $ismobile: boolean }>`
  font-size: ${(props) => (props.$ismobile ? "14px" : "18px")};
  margin-bottom: ${({ $hasMessage }) => ($hasMessage ? "12px" : "0")};
`;

const Message = styled.p<styleType>`
  font-size: ${(props) => (props.$ismobile ? "12px" : "14px")};
  color: ${({ theme }) => theme.modalTextColor};
  margin-bottom: 24px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button<{
  $backgroundColor?: string;
  color?: string;
  $ismobile: boolean;
}>`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: ${(props) => (props.$ismobile ? "10px" : "14px")};
  cursor: pointer;
  background-color: ${({ $backgroundColor }) => $backgroundColor || "#eee"};
  color: ${({ color }) => color || "#333"};
  transition: background-color 0.2s, transform 0.1s;

  &:hover {
    filter: brightness(90%);
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  isRedButton?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  showCancel = true,
  onConfirm,
  onCancel,
  isRedButton = false,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          key="dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() => onCancel?.()}
        >
          <Dialog
            key="dialog-modal"
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            $ismobile={isMobile}
          >
            <Title $hasMessage={!!message} $ismobile={isMobile}>
              {title}
            </Title>
            {message && <Message $ismobile={isMobile}>{message}</Message>}
            <ButtonWrapper>
              {showCancel && (
                <Button
                  $ismobile={isMobile}
                  onClick={onCancel}
                  $backgroundColor="#eee"
                  color="#7C7C7C"
                >
                  취소
                </Button>
              )}
              <Button
                $ismobile={isMobile}
                onClick={onConfirm}
                $backgroundColor={isRedButton ? "#e20000" : "#002C5F"}
                color="#fff"
              >
                확인
              </Button>
            </ButtonWrapper>
          </Dialog>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
