import React, { Component } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory-chart';
import { VictoryTheme } from 'victory-core';
import _ from 'lodash';
import moment from 'moment';

class FitbitStepGraph extends Component {
  render() {
    const { date, data } = this.props;
    const steps = data[date.format('x')];
    if (!steps) return <div>No step data logged</div>;

    const hourlySteps = steps['activities-steps-intraday'].dataset.reduce(function(hourlyBucket, { time, value }) {
      const key = moment(time, 'HH:mm:ss').format('HH[:00]');
      hourlyBucket[key] = hourlyBucket[key] || 0;
      hourlyBucket[key] += value;
      return hourlyBucket;
    }, {});
    const graphData = _.sortBy(_.toPairs(hourlySteps), ([key]) => key).map(([x, y]) => ({ x, y }));

    return (
      <div>
        <h3>{steps['activities-steps'][0].value}</h3>
        <VictoryChart
          domainPadding={{ x: 10 }}
        >
          <VictoryAxis
            style={{
              ticks: { stroke: "grey", size: 3  },
              tickLabels: { fontSize: 8 }
            }}
            tickValues={['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']}
          />
          <VictoryAxis
            dependentAxis
            style={{
              ticks: { stroke: "grey", size: 3  },
              tickLabels: { fontSize: 8 },
              grid: {stroke: 'grey'}
            }}
            tickValues={[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]}
          />
          <VictoryBar
            style={{ data: { fill: "grey" } }}
            data={graphData}
          />
        </VictoryChart>
      </div>
    );
  }
}

export default FitbitStepGraph;
