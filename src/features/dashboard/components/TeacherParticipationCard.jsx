import React from "react";
import { Card, Spin, Table } from "antd";

const TeacherParticipationCard = ({ loading, columns, data, t, onClick }) => {
  return (
    <Card
      title={t("stats.teachersParticipation")}
      style={{ minHeight: "505px", maxHeight: "505px", overflowY: "auto" }}
    >
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false} 
          onRow={(record) => ({
            onClick: (e) => {
              e.stopPropagation();
              if (onClick) onClick(record.id);
            },
            style: { cursor: "pointer" }
          })}
        />
      </Spin>
    </Card>
  );
};

export default TeacherParticipationCard;
