import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Typography, Alert } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import FileUpload from '../common/FileUpload';
import { ResumeParser } from '../../services/resumeParser';

const { Title, Text } = Typography;

const ResumeUploader = ({ onComplete, loading, progress }) => {
  const [form] = Form.useForm();
  const [parseResults, setParseResults] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  const handleFileSelect = async (file) => {
    try {
      const results = await ResumeParser.parseFile(file);
      const missing = ResumeParser.validateFields(results.fields);
      
      setParseResults({
        ...results,
        fileName: file.name,
      });
      setMissingFields(missing);
      
      // Pre-fill form with extracted data
      form.setFieldsValue(results.fields);
      
    } catch (error) {
      console.error('File parsing error:', error);
      // Allow manual entry if parsing fails
      setParseResults({
        text: '',
        fields: { name: '', email: '', phone: '' },
        fileName: file.name,
      });
      setMissingFields(['name', 'email', 'phone']);
    }
  };

  const handleSubmit = (values) => {
    const candidateData = {
      ...values,
      resumeText: parseResults?.text || '',
      resumeFileName: parseResults?.fileName || '',
    };
    
    onComplete(candidateData);
  };

  if (!parseResults) {
    return (
      <Card title="Upload Your Resume" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <FileUpload
          onFileSelect={handleFileSelect}
          loading={loading}
          progress={progress}
        />
      </Card>
    );
  }

  return (
    <Card title="Verify Your Information" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {missingFields.length > 0 && (
        <Alert
          message="Missing Information"
          description="Some information couldn't be extracted from your resume. Please fill in the missing fields below."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter your full name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="John Doe"
            status={missingFields.includes('name') ? 'warning' : undefined}
          />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="john.doe@example.com"
            status={missingFields.includes('email') ? 'warning' : undefined}
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: 'Please enter your phone number' },
            { min: 10, message: 'Please enter a valid phone number' }
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="(555) 123-4567"
            status={missingFields.includes('phone') ? 'warning' : undefined}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large">
              Start Interview
            </Button>
            <Button onClick={() => setParseResults(null)}>
              Upload Different Resume
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
        <Text type="secondary">
          <strong>File:</strong> {parseResults.fileName}
        </Text>
      </div>
    </Card>
  );
};

export default ResumeUploader;