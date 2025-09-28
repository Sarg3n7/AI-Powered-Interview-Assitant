import React from 'react';
import { Table, Input, Select, Button, Space, Tag, Typography, Card, Popconfirm, Statistic, Row, Col, message } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilteredAndSortedCandidates } from '../../store/slices/candidatesSlice';
import { setSearchTerm, setSorting, deleteCandidate } from '../../store/slices/candidatesSlice';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const Dashboard = ({ onViewCandidate }) => {
  const dispatch = useDispatch();
  const candidates = useSelector(selectFilteredAndSortedCandidates);
  const allCandidates = useSelector(state => Object.values(state.candidates.candidates));
  const { searchTerm, sortBy, sortOrder } = useSelector(state => state.candidates);

  // Calculate statistics
  const totalCandidates = allCandidates.length;
  const completedCandidates = allCandidates.filter(c => c.status === 'completed').length;
  const incompleteCandidates = allCandidates.filter(c => c.status === 'incomplete').length;
  const averageScore = completedCandidates > 0 
    ? Math.round(allCandidates
        .filter(c => c.finalScore !== null)
        .reduce((sum, c) => sum + c.finalScore, 0) / completedCandidates)
    : 0;

  const handleSearch = (value) => {
    dispatch(setSearchTerm(value));
  };

  const handleSortChange = (field) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
  };

  const handleDelete = (candidateId) => {
    dispatch(deleteCandidate(candidateId));
    message.success('Candidate deleted successfully');
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="green">Completed</Tag>;
      case 'incomplete':
        return <Tag color="orange">Incomplete</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const getScoreDisplay = (score) => {
    if (score === null || score === undefined) return '-';
    return (
      <Tag color={score >= 60 ? 'green' : score >= 40 ? 'orange' : 'red'}>
        {score}/100
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Score',
      dataIndex: 'finalScore',
      key: 'finalScore',
      sorter: true,
      render: getScoreDisplay,
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      align: 'center',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (timestamp) => new Date(timestamp).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewCandidate(record)}
            size="small"
          >
            View
          </Button>
          <Popconfirm
            title="Delete candidate"
            description="Are you sure you want to delete this candidate? This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      align: 'center',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3}>Candidate Dashboard</Title>
        <Text type="secondary">
          Manage and review interview candidates
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Candidates"
              value={totalCandidates}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedCandidates}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={incompleteCandidates}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={averageScore}
              suffix="/ 100"
              valueStyle={{ color: averageScore >= 60 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Search
          placeholder="Search by name or email..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        />
        
        <Select
          value={`${sortBy}_${sortOrder}`}
          onChange={(value) => {
            const [field, order] = value.split('_');
            dispatch(setSorting({ sortBy: field, sortOrder: order }));
          }}
          style={{ width: 200 }}
        >
          <Option value="date_desc">Newest First</Option>
          <Option value="date_asc">Oldest First</Option>
          <Option value="score_desc">Highest Score</Option>
          <Option value="score_asc">Lowest Score</Option>
          <Option value="name_asc">Name A-Z</Option>
          <Option value="name_desc">Name Z-A</Option>
        </Select>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          onChange={(pagination, filters, sorter) => {
            if (sorter.field) {
              handleSortChange(sorter.field);
            }
          }}
        />

        {candidates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">
              {searchTerm ? 'No candidates match your search' : 'No candidates yet'}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;