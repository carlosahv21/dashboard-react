import React from 'react';
import { Card, theme } from 'antd';

const DetailCard = ({ title, icon, children, extra, actions, bodyStyle, style, className }) => {
    const { token } = theme.useToken();

    // Si pasamos un componente en icon, lo formateamos con un layout unificado
    const formattedTitle = icon ? (
        <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon, {
                style: { ...(icon.props.style || {}), color: token.colorPrimary, marginRight: 8 }
            })}
            {title}
        </span>
    ) : (
        title
    );

    return (
        <Card
            title={formattedTitle}
            extra={extra}
            actions={actions}
            bordered={false}
            className={className}
            style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                ...style
            }}
            bodyStyle={bodyStyle}
        >
            {children}
        </Card>
    );
};

export default DetailCard;
