import React, { useState } from 'react';
import { Modal, Descriptions, Timeline, Card, Button, InputNumber, Typography, Space, Tag, Divider, Dropdown, message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectSessionById } from '../../store/slices/sessionsSlice';
import { completeCandidate } from '../../store/slices/candidatesSlice';
import { scoreQuestion } from '../../store/slices/sessionsSlice';
import { ExportUtils } from '../../utils/exportUtils';

const { Title, Text, Paragraph } = Typography;

const CandidateDetail = ({ visible, candidate, onClose }) => {
  const dispatch = useDispatch();
  const [editingScores, setEditingScores] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Find the session for this candidate
  const sessions = useSelector(state => state.sessions.sessions);
  const session = Object.values(sessions).find(s => s.candidateId === candidate?.id);

  const handleScoreEdit = (questionIndex, newScore) => {
    setEditingScores(prev => ({
      ...prev,
      [questionIndex]: newScore
    }));
  };

  const saveScoreChanges = () => {
    if (session) {
      Object.entries(editingScores).forEach(([questionIndex, score]) => {
        dispatch(scoreQuestion({
          sessionId: session.id,
          questionIndex: parseInt(questionIndex),
          score: score,
          rubric: session.questions[questionIndex].rubric
        }));
      });

      // Recalculate final score
      const totalScore = session.questions.reduce((sum, q, index) => {
        const score = editingScores[index] !== undefined ? editingScores[index] : (q.score || 0);
        return sum + score;
      }, 0);

      const finalScore = Math.round((totalScore / (session.questions.length * 15)) * 100);

      dispatch(completeCandidate({
        id: candidate.id,
        finalScore,
        aiSummary: candidate.aiSummary || 'Interview completed with manual score adjustments.'
      }));
    }

    setEditingScores({});
    setIsEditing(false);
  };

  const handleExport = (format) => {
    if (!candidate || !session) return;
    ExportUtils.exportCandidate(candidate, session, format);
    message.success(`Transcript exported as ${format.toUpperCase()}`);
  };

  const exportMenuItems = [
    {
      key: 'json',
      label: 'Export as JSON',
      icon: <DownloadOutlined />,
      onClick: () => handleExport('json'),
    },
    {
      key: 'txt',
      label: 'Export as Text',
      icon: <FileTextOutlined />,
      onClick: () => handleExport('txt'),
    },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'green';
      case 'Medium': return 'orange';
      case 'Hard': return 'red';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 12) return '#52c41a'; // Green
    if (score >= 8) return '#faad14';  // Orange
    return '#ff4d4f'; // Red
  };

  if (!candidate) return null;

  return (
    <Modal
      title={`Interview Details - ${candidate.name}`}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Dropdown key="export" menu={{ items: exportMenuItems }} placement="topLeft">
          <Button icon={<DownloadOutlined />}>
            Export Transcript
          </Button>
        </Dropdown>,
        <Button
          key="edit"
          type={isEditing ? "default" : "primary"}
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={() => {
            if (isEditing) {
              setEditingScores({});
            }
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? 'Cancel' : 'Edit Scores'}
        </Button>,
        isEditing && (
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveScoreChanges}
          >
            Save Changes
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Name">{candidate.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{candidate.phone}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={candidate.status === 'completed' ? 'green' : 'orange'}>
              {candidate.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Final Score">
            {candidate.finalScore !== null ? (
              <Tag color={candidate.finalScore >= 60 ? 'green' : candidate.finalScore >= 40 ? 'orange' : 'red'}>
                {candidate.finalScore}/100
              </Tag>
            ) : (
              <Tag color="default">Not scored</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Interview Date">
            {new Date(candidate.createdAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {candidate.aiSummary && (
          <>
            <Title level={4}>AI Summary</Title>
            <Card type="inner" style={{ marginBottom: '24px' }}>
              <Paragraph>{candidate.aiSummary}</Paragraph>
            </Card>
          </>
        )}

        {session && (
          <>
            <Title level={4}>Interview Transcript</Title>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Text type="secondary">
                  Total Score: {session.questions.reduce((sum, q) => sum + (q.score || 0), 0)}/{session.questions.length * 15}
                </Text>
                <Text type="secondary">
                  Completed: {session.questions.filter(q => q.answer).length}/{session.questions.length} questions
                </Text>
              </Space>
            </div>
            <Timeline
              items={session.questions.map((question, index) => ({
                key: index,
                children: (
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <Text strong>Question {index + 1}</Text>
                        <Tag color={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Tag>
                        {question.autoSubmitted && (
                          <Tag color="warning">Auto-submitted</Tag>
                        )}
                      </Space>
                    }
                    extra={
                      <Space>
                        <Text type="secondary">Score:</Text>
                        {isEditing ? (
                          <InputNumber
                            min={0}
                            max={15}
                            value={editingScores[index] !== undefined ? editingScores[index] : question.score}
                            onChange={(value) => handleScoreEdit(index, value)}
                            style={{ width: '80px' }}
                          />
                        ) : (
                          <Tag color={getScoreColor(question.score || 0)}>
                            {question.score || 0}/15
                          </Tag>
                        )}
                      </Space>
                    }
                  >
                    <Paragraph strong style={{ marginBottom: '12px' }}>
                      {question.text}
                    </Paragraph>
                    <Divider />
                    <Paragraph style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
                      {question.answer || <Text type="secondary">No answer provided</Text>}
                    </Paragraph>
                    <Text type="secondary">
                      Time limit: {question.timeLimit} seconds
                      {question.autoSubmitted && ' • Auto-submitted due to timeout'}
                    </Text>
                  </Card>
                ),
              }))}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default CandidateDetail;