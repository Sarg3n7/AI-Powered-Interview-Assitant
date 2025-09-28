import React, { useState, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Typography, Space, Tag } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ChatInterface = ({ missingFields, onComplete, candidateName }) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [collectedFields, setCollectedFields] = useState({});

  const fieldLabels = {
    name: 'full name',
    email: 'email address',
    phone: 'phone number'
  };

  useEffect(() => {
    if (missingFields.length > 0) {
      const field = missingFields[0];
      setMessages([{
        id: 1,
        type: 'system',
        content: `Hi ${candidateName || 'there'}! I need to collect some information that wasn't found in your resume. Let's start with your ${fieldLabels[field]}. Please provide your ${fieldLabels[field]}:`
      }]);
    }
  }, [missingFields, candidateName]);

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const currentField = missingFields[currentFieldIndex];
    const newCollectedFields = {
      ...collectedFields,
      [currentField]: currentInput.trim()
    };

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: currentInput.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setCollectedFields(newCollectedFields);
    setCurrentInput('');

    // Check if we have more fields to collect
    const nextFieldIndex = currentFieldIndex + 1;
    if (nextFieldIndex < missingFields.length) {
      const nextField = missingFields[nextFieldIndex];
      const systemMessage = {
        id: messages.length + 2,
        type: 'system',
        content: `Great! Now please provide your ${fieldLabels[nextField]}:`
      };
      
      setMessages(prev => [...prev, systemMessage]);
      setCurrentFieldIndex(nextFieldIndex);
    } else {
      // All fields collected
      const completionMessage = {
        id: messages.length + 2,
        type: 'system',
        content: 'Perfect! I have all the information I need. You can now start your interview.'
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      // Wait a moment then complete
      setTimeout(() => {
        onComplete(newCollectedFields);
      }, 1000);
    }
  };

  const isCompleted = Object.keys(collectedFields).length === missingFields.length;

  return (
    <Card title="Information Collection" style={{ height: '500px', display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ flex: 1, overflow: 'auto', marginBottom: '16px' }}>
        <List
          dataSource={messages}
          renderItem={message => (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}>
                <div style={{
                  maxWidth: '70%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar 
                    icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ 
                      backgroundColor: message.type === 'user' ? '#1890ff' : '#52c41a',
                      margin: message.type === 'user' ? '0 0 0 8px' : '0 8px 0 0'
                    }}
                  />
                  <div style={{
                    backgroundColor: message.type === 'user' ? '#1890ff' : '#f0f0f0',
                    color: message.type === 'user' ? 'white' : 'black',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '100%'
                  }}>
                    <Text style={{ color: 'inherit' }}>{message.content}</Text>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      <div style={{ marginTop: 'auto' }}>
        {!isCompleted && (
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={`Enter your ${fieldLabels[missingFields[currentFieldIndex]] || 'information'}...`}
              autoSize={{ minRows: 1, maxRows: 3 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!currentInput.trim()}
            >
              Send
            </Button>
          </Space.Compact>
        )}

        <div style={{ marginTop: '12px' }}>
          <Text type="secondary">
            Collecting: {missingFields.map(field => (
              <Tag 
                key={field} 
                color={collectedFields[field] ? 'green' : 'default'}
              >
                {fieldLabels[field]}
              </Tag>
            ))}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;