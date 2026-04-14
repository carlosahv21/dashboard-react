import React from "react";
import { Card, Spin, Table } from "antd";

const TeacherParticipationCard = ({ loading, columns, data, t, onClick }) => {
  return (
    <Card
      title={t("stats.teachersParticipation")}
      hoverable
      onClick={onClick}
      style={{ minHeight: "505px", maxHeight: "505px", overflowY: "auto", cursor: "pointer" }}
    >
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Spin>
    </Card>
  );
};

export default TeacherParticipationCard;
