import React from "react";

import TotalSellSeasonBarChart from "./TotalSellSeasonsBarChart";
import TotalSellYearsBarChart from "./TotalSellYearsBarChart";
function Charts() {
    return (
        <div className='chart-container'>
            <div className='chart-item'>
                <TotalSellSeasonBarChart />
            </div>
            <hr />
            <div className='chart-item' style={{ paddingTop: "100px" }}>
                <TotalSellYearsBarChart />
            </div>
        </div>
    );
}

export default Charts;
