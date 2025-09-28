import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Tag,
  Progress,
  Alert,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { updateAnswer } from "../../store/slices/sessionsSlice";
import { TimerUtils } from "../../utils/timerUtils";

const { TextArea } = Input;
const { Text, Title } = Typography;

const InterviewChat = ({ session, onSubmit }) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const questionNumber = session.currentQuestionIndex + 1;
  const totalQuestions = session.questions.length;

  useEffect(() => {
    const newMessages = [];

    if (session.currentQuestionIndex === 0) {
      newMessages.push({
        id: "welcome",
        type: "system",
        content: `Welcome to your interview! You'll be answering ${totalQuestions} questions. Let's begin with question ${questionNumber}:`,
        timestamp: Date.now(),
      });
    } else {
      newMessages.push({
        id: `q${questionNumber}-intro`,
        type: "system",
        content: `Great! Now let's move to question ${questionNumber}:`,
        timestamp: Date.now(),
      });
    }

    newMessages.push({
      id: `q${questionNumber}`,
      type: "system",
      content: currentQuestion.text,
      timestamp: Date.now(),
      isQuestion: true,
      difficulty: currentQuestion.difficulty,
      timeLimit: currentQuestion.timeLimit,
    });

    setMessages(newMessages);
    setCurrentAnswer(currentQuestion.answer || "");
    setIsSubmitting(false);
  }, [session.currentQuestionIndex, currentQuestion]);

  useEffect(() => {
    if (!currentQuestion.endTimestamp || isSubmitting) return;

    const updateTimer = () => {
      const remaining = TimerUtils.getRemainingTime(
        currentQuestion.endTimestamp
      );
      setRemainingTime(remaining);

      if (remaining <= 0) {
        handleTimeout();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion.endTimestamp, isSubmitting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTimeout = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `timeout-${questionNumber}`,
        type: "system",
        content:
          "⏰ Time's up! Your answer has been automatically submitted.",
        timestamp: Date.now(),
        isTimeout: true,
      },
    ]);

    setTimeout(() => {
      onSubmit(currentAnswer, true);
    }, 1500);
  };

  const handleAnswerChange = (value) => {
    setCurrentAnswer(value);
    dispatch(
      updateAnswer({
        sessionId: session.id,
        questionIndex: session.currentQuestionIndex,
        answer: value,
      })
    );
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `answer-${questionNumber}`,
        type: "user",
        content: currentAnswer,
        timestamp: Date.now(),
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `processing-${questionNumber}`,
          type: "system",
          content: "✅ Answer submitted! Processing your response...",
          timestamp: Date.now(),
          isProcessing: true,
        },
      ]);
    }, 500);

    setTimeout(() => {
      onSubmit(currentAnswer, false);
    }, 1500);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "green";
      case "Medium":
        return "orange";
      case "Hard":
        return "red";
      default:
        return "default";
    }
  };

  const getTimerColor = () => {
    const percentage = remainingTime / currentQuestion.timeLimit;
    if (percentage > 0.5) return "#52c41a";
    if (percentage > 0.25) return "#faad14";
    return "#ff4d4f";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Card style={{ marginBottom: "8px", flexShrink: 0 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Question {questionNumber} of {totalQuestions}
            </Title>
            <Space>
              <Tag color={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Tag>
              <Text type="secondary">
                <ClockCircleOutlined /> {currentQuestion.timeLimit}s limit
              </Text>
            </Space>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: getTimerColor(),
                marginBottom: "4px",
              }}
            >
              {formatTime(remainingTime)}
            </div>
            <Progress
              percent={
                ((currentQuestion.timeLimit - remainingTime) /
                  currentQuestion.timeLimit) *
                100
              }
              strokeColor={getTimerColor()}
              showInfo={false}
              size="small"
              style={{ width: "100px" }}
            />
          </div>
        </div>

        <Progress
          percent={(session.currentQuestionIndex / totalQuestions) * 100}
          showInfo={false}
          style={{ marginTop: "12px" }}
        />
      </Card>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 0",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item style={{ border: "none", padding: "8px 16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    message.type === "user" ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    display: "flex",
                    alignItems: "flex-start",
                    flexDirection:
                      message.type === "user" ? "row-reverse" : "row",
                  }}
                >
                  <Avatar
                    icon={
                      message.type === "user" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                    style={{
                      backgroundColor:
                        message.type === "user" ? "#1890ff" : "#52c41a",
                      margin:
                        message.type === "user" ? "0 0 0 8px" : "0 8px 0 0",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: message.isQuestion
                        ? "#f0f9ff"
                        : message.isTimeout
                        ? "#fff2e8"
                        : message.isProcessing
                        ? "#f6ffed"
                        : message.type === "user"
                        ? "#1890ff"
                        : "#f0f0f0",
                      color: message.type === "user" ? "white" : "black",
                      padding: message.isQuestion ? "16px" : "12px",
                      borderRadius: "12px",
                      border: message.isQuestion
                        ? "2px solid #1890ff"
                        : "none",
                      maxWidth: "100%",
                    }}
                  >
                    {message.isQuestion && (
                      <div style={{ marginBottom: "8px" }}>
                        <Tag color={getDifficultyColor(message.difficulty)}>
                          {message.difficulty}
                        </Tag>
                        <Tag color="blue">{message.timeLimit}s</Tag>
                      </div>
                    )}
                    <Text
                      style={{
                        color: "inherit",
                        fontSize: message.isQuestion ? "16px" : "14px",
                        fontWeight: message.isQuestion ? "500" : "normal",
                      }}
                    >
                      {message.content}
                    </Text>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isSubmitting && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            padding: "12px",
            marginTop: "8px",
            flexShrink: 0,
            background: "#fff",
            borderRadius: "8px",
          }}
        >
          {remainingTime <= 10 && remainingTime > 0 && (
            <Alert
              message="Time running out!"
              description="Your answer will be auto-submitted when time expires."
              type="warning"
              showIcon
              style={{ marginBottom: "12px" }}
            />
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <TextArea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ flex: 1, overflowY: "auto" }}
              onPressEnter={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  handleSubmit();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              disabled={!currentAnswer.trim()}
              style={{ alignSelf: "flex-end" }}
            >
              Submit
            </Button>
          </div>

          <Text
            type="secondary"
            style={{
              fontSize: "12px",
              marginTop: "4px",
              display: "block",
            }}
          >
            Press Ctrl+Enter to submit quickly
          </Text>
        </div>
      )}
    </div>
  );
};

export default InterviewChat;
