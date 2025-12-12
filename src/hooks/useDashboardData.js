import useFetch from "./useFetch";

import useKpisData from '../reports/useKpisData';
import { useUserDistributionReport } from '../reports/useUserDistributionReport';
import { useClassOccupancyReport } from '../reports/useClassOccupancyReport';


export const useDashboardData = () => {
    const { request } = useFetch();

    const { kpiLoading, kpiData } = useKpisData(request);
    const { userDistributionLoading, userDistributionOption } = useUserDistributionReport(request);

    const {
        classOccupancyLoading,
        availableGenres,
        selectedGenre,
        setSelectedGenre,
        occupancyDrilldownOption,
        onOccupancyChartReady
    } = useClassOccupancyReport(request);


    const overallLoading = kpiLoading || userDistributionLoading || classOccupancyLoading;

    return {
        loading: overallLoading,
        kpiData,
        charts: {
            userDistribution: userDistributionOption,
            occupancyDrilldown: occupancyDrilldownOption,
        },
        onOccupancyChartReady,
        availableGenres,
        selectedGenre,
        setSelectedGenre,
    };
};