import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Layout, Tabs, Typography, Spin } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { store, persistor } from './store/store';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import ErrorBoundary from './components/common/ErrorBoundary';
import { syncService } from './services/syncService';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('interviewee');

  useEffect(() => {
    // Subscribe to cross-tab sync
    const unsubscribe = syncService.subscribe((type, payload) => {
      if (type === 'TAB_CHANGE') {
        setActiveTab(payload.activeTab);
      }
    });

    return () => {
      unsubscribe();
      syncService.close();
    };
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    syncService.broadcastTabChange(key);
  };

  const tabItems = [
    {
      key: 'interviewee',
      label: (
        <span>
          <UserOutlined />
          Interviewee
        </span>
      ),
      children: <IntervieweeTab />,
    },
    {
      key: 'interviewer',
      label: (
        <span>
          <TeamOutlined />
          Interviewer
        </span>
      ),
      children: <InterviewerTab />,
    },
  ];

  return (
    <ErrorBoundary>
    <Layout className="min-h-screen">
      <Header className="app-header">
        <Title level={2} className="app-header-title">
          🚀 AI Powered Interview Assistant
        </Title>
      </Header>

      
      <Content className="p-6">
        <div className="bg-white min-h-[calc(100vh-112px)] rounded-lg overflow-hidden shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            size="large"
            items={tabItems}
            className="px-6"
          />
        </div>
      </Content>
    </Layout>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ErrorBoundary>
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="flex justify-center items-center h-screen">
            <Spin size="large" />
          </div>
        } 
        persistor={persistor}
      >
        <AppContent />
      </PersistGate>
    </Provider>
    </ErrorBoundary>
  );
}

export default App;