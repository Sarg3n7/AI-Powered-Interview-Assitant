import React, { useState } from 'react';
import { Upload, message, Progress, Card, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const FileUpload = ({ onFileSelect, loading = false, progress = 0 }) => {
  const [dragOver, setDragOver] = useState(false);

  const props = {
    name: 'resume',
    multiple: false,
    accept: '.pdf,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      const isPdf = file.type === 'application/pdf';
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isPdf && !isDocx) {
        message.error('Please upload only PDF or DOCX files!');
        return Upload.LIST_IGNORE;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }
      
      onFileSelect(file);
      return false; // Prevent default upload
    },
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    onDrop: () => setDragOver(false),
  };

  if (loading) {
    return (
      <Card className="text-center py-10">
        <Title level={4}>Processing Resume...</Title>
        <Progress percent={progress} />
        <Text type="secondary" className="mt-4 block">
          Extracting text and parsing information...
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Dragger
        {...props}
        className={`${dragOver ? 'bg-blue-50 border-blue-400' : ''}`}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined className="text-5xl" />
        </p>
        <p className="ant-upload-text">
          Click or drag your resume to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for PDF and DOCX files only. Maximum size: 10MB
        </p>
      </Dragger>
    </Card>
  );
};

export default FileUpload;