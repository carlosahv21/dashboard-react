import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useAttendanceColumns } from "../hooks/useAttendanceColumns";
import { useTranslation } from "react-i18next";

const AttendanceListPage = () => {
    const { t } = useTranslation();
    const endpoint = "attendances";
    const titleSingular = t('attendances.name_singular', { defaultValue: "Asistencia" });
    const titlePlural = t('attendances.name_plural', { defaultValue: "Asistencias" });
    const moduleFieldId = "attendances";

    const columns = useAttendanceColumns();

    return (
        <BaseView
            endpoint={endpoint}
            titleSingular={titleSingular}
            titlePlural={titlePlural}
            moduleFieldId={moduleFieldId}
            columns={columns}
            viewOptions={["table"]}
            extraActions={[
                {
                    label: t("attendances.track_attendance", { defaultValue: "Tomar Asistencia" }),
                    path: "/attendances",
                    icon: "CheckSquare"
                }
            ]}
        />
    );
};

export default AttendanceListPage;
