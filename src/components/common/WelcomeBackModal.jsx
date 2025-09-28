import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { PlayCircleOutlined, RedoOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const WelcomeBackModal = ({ 
  visible, 
  onResume, 
  onStartOver, 
  onViewResults, 
  candidateName,
  sessionData 
}) => {
  const currentQuestion = sessionData?.currentQuestionIndex + 1 || 1;
  const totalQuestions = sessionData?.questions?.length || 6;
  const completedQuestions = sessionData?.questions?.filter(q => q.answer).length || 0;

  return (
    <Modal
      title={
        <Title level={3} className="m-0 text-center">
          Welcome Back!
        </Title>
      }
      open={visible}
      footer={null}
      closable={false}
      centered
      width={500}
    >
      <div className="text-center py-5">
        <Text className="text-base mb-6 block">
          We found an incomplete interview session for{' '}
          <strong>{candidateName || 'your session'}</strong>.
        </Text>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <Text type="secondary">
            Progress: {completedQuestions} of {totalQuestions} questions completed
          </Text>
          <br />
          <Text type="secondary">
            Current: Question {currentQuestion}
          </Text>
        </div>
        
        <Text className="text-sm mb-6 block">
          What would you like to do?
        </Text>
        
        <Space direction="vertical" size="large" className="w-full">
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={onResume}
            className="w-full h-12"
          >
            Resume Interview (Question {currentQuestion})
          </Button>
          
          <Button
            size="large"
            icon={<RedoOutlined />}
            onClick={onStartOver}
            className="w-full h-12"
          >
            Start Over
          </Button>
          
          <Button
            size="large"
            icon={<EyeOutlined />}
            onClick={onViewResults}
            className="w-full h-12"
          >
            View Results
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;