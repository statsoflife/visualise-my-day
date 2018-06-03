import React, { Component } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory-chart';
import { VictoryTheme } from 'victory-core';
import _ from 'lodash';
import moment from 'moment';

function round(date, duration) {
  return moment(Math.floor((+date) / (+duration)) * (+duration));
}

class FitbitHeartGraph extends Component {
  render() {
    const { date, data } = this.props;
    const steps = data[date.format('x')];
    if (!steps) return <div>No heart data logged</div>;

    const bucketedHeart = steps['activities-heart-intraday'].dataset.reduce(function(buckets, { time, value }) {
      const key = round(moment(time, 'HH:mm:ss'), moment.duration(10, "minutes")).format('HH:mm')
      buckets[key] = buckets[key] || [];
      buckets[key].push(value);
      return buckets;
    }, {});

    const graphData = _.sortBy(_.toPairs(bucketedHeart), ([key]) => key).map(([x, y]) => ({ x, y: Math.round(_.mean(y) * 10) / 10 }));

    console.log('graphData', graphData)

    return (
      <div>
        <h3>Resting: {steps['activities-heart'][0].value.restingHeartRate}</h3>
        <VictoryChart
          domainPadding={{ x: 15 }}
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
          />
          <VictoryBar
            alignment="start"
            style={{ data: { fill: "grey" } }}
            data={graphData}
          />
        </VictoryChart>
      </div>
    );
  }
}

export default FitbitHeartGraph;
