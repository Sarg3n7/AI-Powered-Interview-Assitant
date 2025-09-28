import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Steps, Button, Typography, message } from "antd";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { store } from "../store/store";
import ResumeUploader from "./interviewee/ResumeUploader";
import ChatInterface from "./interviewee/ChatInterface";
import InterviewChat from "./interviewee/InterviewChat";
import WelcomeBackModal from "./common/WelcomeBackModal";
import { geminiService } from "../services/geminiService";
import { ResumeParser } from "../services/resumeParser";
import {
  addCandidate,
  completeCandidate,
  selectCandidateById,
} from "../store/slices/candidatesSlice";
import {
  createSession,
  startSession,
  startQuestion,
  submitAnswer,
  scoreQuestion,
  completeSession,
  selectActiveSession,
} from "../store/slices/sessionsSlice";
import {
  setCurrentStep,
  setMissingFields,
  setGeneratingQuestions,
  setShowWelcomeBack,
} from "../store/slices/uiSlice";

const { Title, Text } = Typography;

const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const activeSession = useSelector(selectActiveSession);
  const { currentStep, missingFields, isGeneratingQuestions, showWelcomeBack } =
    useSelector((state) => state.ui);

  const [candidateId, setCandidateId] = useState(null);
  const [collectedFields, setCollectedFields] = useState({});

  const candidate = useSelector((state) =>
    candidateId ? selectCandidateById(state, candidateId) : null
  );

  // Show Welcome Back if we find an incomplete session
  useEffect(() => {
    const sessions = Object.values(store.getState().sessions.sessions || {});
    const incomplete = sessions.find(
      (s) => s.status === "in_progress" || s.status === "paused"
    );
    if (incomplete) dispatch(setShowWelcomeBack(true));
  }, [dispatch]);

  // ---------- Resume upload flow ----------
  const handleResumeUpload = async (candidateData) => {
    dispatch(setCurrentStep("validating"));

    try {
      const missing = ResumeParser.validateFields(candidateData);

      if (missing.length > 0) {
        dispatch(setMissingFields(missing));
        setCollectedFields(candidateData);
        dispatch(setCurrentStep("chat"));
        return;
      }

      const action = dispatch(addCandidate(candidateData));
      const state = store.getState();
      const newCandidateId = Object.keys(state.candidates.candidates).find(
        (id) => state.candidates.candidates[id].email === candidateData.email
      );
      setCandidateId(newCandidateId);

      await startInterview(newCandidateId, candidateData.resumeText);
    } catch (err) {
      console.error("Resume upload error:", err);
      message.error("Something went wrong while processing your resume.");
      dispatch(setCurrentStep("upload"));
    }
  };

  const handleFieldsCollected = async (fields) => {
    const completeData = { ...collectedFields, ...fields };

    dispatch(addCandidate(completeData));
    const state = store.getState();
    const newCandidateId = Object.keys(state.candidates.candidates).find(
      (id) => state.candidates.candidates[id].email === completeData.email
    );
    setCandidateId(newCandidateId);

    await startInterview(newCandidateId, completeData.resumeText || "");
  };

  // ---------- Start interview ----------
  const startInterview = async (candId, resumeText) => {
    dispatch(setGeneratingQuestions(true));
    dispatch(setCurrentStep("generating"));

    try {
      const candData = store.getState().candidates.candidates[candId];
      const questions = await geminiService.generateQuestions(
        resumeText,
        candData?.name
      );

      dispatch(createSession({ candidateId: candId, questions }));

      const newSession = Object.values(
        store.getState().sessions.sessions
      ).find((s) => s.candidateId === candId);

      if (newSession) {
        dispatch(startSession(newSession.id));
        dispatch(startQuestion({ sessionId: newSession.id, questionIndex: 0 }));
      }

      dispatch(setCurrentStep("interview"));
    } catch (error) {
      console.error("Question generation error:", error);
      message.error("Failed to generate questions. Please try again.");
      dispatch(setCurrentStep("upload"));
    } finally {
      dispatch(setGeneratingQuestions(false));
    }
  };

  // ---------- Submit/score answer ----------
  const handleAnswerSubmit = async (answer, autoSubmitted = false) => {
    if (!activeSession) return;
    const idx = activeSession.currentQuestionIndex;

    dispatch(
      submitAnswer({
        sessionId: activeSession.id,
        questionIndex: idx,
        answer,
        autoSubmitted,
      })
    );

    try {
      const q = activeSession.questions[idx];
      const scoreResult = await geminiService.scoreAnswer(q.text, answer);
      dispatch(
        scoreQuestion({
          sessionId: activeSession.id,
          questionIndex: idx,
          score: scoreResult?.score ?? 0,
          rubric: scoreResult?.rubric ?? {
            correctness: 0,
            completeness: 0,
            clarity: 0,
            problemSolving: 0,
            codeQuality: 0,
          },
        })
      );
    } catch (err) {
      console.error("Scoring error:", err);
      // soft-fail: keep the interview moving
    }

    // Next question or finish
    if (idx < activeSession.questions.length - 1) {
      dispatch(
        startQuestion({ sessionId: activeSession.id, questionIndex: idx + 1 })
      );
    } else {
      await completeInterview();
    }
  };

  // ---------- Complete interview & summary ----------
  const completeInterview = async () => {
    if (!activeSession || !candidate) return;

    const totalScore = activeSession.questions.reduce(
      (sum, q) => sum + (q.score || 0),
      0
    );
    const finalScore = Math.round(
      (totalScore / (activeSession.questions.length * 15)) * 100
    );

    try {
      const summary = await geminiService.createSummary(candidate, activeSession);

      const safeSummary =
        summary?.summary ||
        "Interview completed. (AI summary was unavailable; showing default note.)";

      dispatch(
        completeCandidate({
          id: candidate.id,
          finalScore,
          aiSummary: safeSummary,
        })
      );
    } catch (err) {
      console.error("Summary generation error:", err);
      const fallback = geminiService.getFallbackSummary(candidate, activeSession);
      dispatch(
        completeCandidate({
          id: candidate.id,
          finalScore,
          aiSummary: fallback.summary,
        })
      );
    }

    dispatch(completeSession(activeSession.id));
    dispatch(setCurrentStep("completed"));
  };

  // Welcome Back Modal controls
  const handleResumeInterview = () => dispatch(setShowWelcomeBack(false));
  const handleStartOver = () => {
    if (activeSession) dispatch(completeSession(activeSession.id));
    dispatch(setShowWelcomeBack(false));
    dispatch(setCurrentStep("upload"));
    setCandidateId(null);
  };
  const handleViewResults = () => dispatch(setShowWelcomeBack(false));

  const getStepContent = () => {
    switch (currentStep) {
      case "upload":
        return <ResumeUploader onComplete={handleResumeUpload} />;

      case "chat":
        return (
          <ChatInterface
            missingFields={missingFields}
            onComplete={handleFieldsCollected}
            candidateName={candidate?.name}
          />
        );

      case "generating":
        return (
          <Card className="text-center py-16">
            <LoadingOutlined className="text-5xl mb-5" />
            <Title level={3}>Generating Interview Questions</Title>
            <Text>
              Using Gemini to create personalized questions based on your resume…
            </Text>
          </Card>
        );

      case "interview":
        if (!activeSession) return null;
        return (
          <InterviewChat session={activeSession} onSubmit={handleAnswerSubmit} />
        );

      case "completed":
        return (
          <Card className="text-center py-16">
            <CheckCircleOutlined className="text-5xl text-green-500 mb-5" />
            <Title level={2}>Interview Completed!</Title>
            <Text className="text-base">
              Thank you for completing the interview. Your responses have been
              recorded.
            </Text>
            <div className="mt-6">
              <Button
                type="primary"
                size="large"
                onClick={() => dispatch(setCurrentStep("upload"))}
              >
                Start New Interview
              </Button>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "upload":
      case "validating":
        return 0;
      case "chat":
      case "generating":
        return 1;
      case "interview":
        return 2;
      case "completed":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="p-6">
      <WelcomeBackModal
        visible={showWelcomeBack}
        onResume={handleResumeInterview}
        onStartOver={handleStartOver}
        onViewResults={handleViewResults}
        candidateName={candidate?.name}
        sessionData={activeSession}
      />

      <Steps
        current={getStepNumber()}
        className="mb-8"
        items={[
          { title: "Upload Resume", description: "Upload and verify information" },
          { title: "Preparation", description: "AI generates questions" },
          { title: "Interview", description: "Answer 6 timed questions" },
          { title: "Complete", description: "Review submission" },
        ]}
      />

      {getStepContent()}
    </div>
  );
};

export default IntervieweeTab;
