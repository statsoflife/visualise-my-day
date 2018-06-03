import React, { Component } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory-chart';
import _ from 'lodash';
import moment from 'moment';

function round(date, duration) {
  return moment(Math.floor((+date) / (+duration)) * (+duration));
}

class FitbitStepGraph extends Component {
  render() {
    const { date, time, data } = this.props;
    const steps = data[date.format('x')];
    if (_.isUndefined(steps)) return <div>Loading...</div>;
    if (_.isNull(steps)) return <div>No step data logged</div>;

    const bucketSize = moment.duration(10, 'minutes');
    const bucketedSteps = steps['activities-steps-intraday'].dataset.reduce(function(buckets, { time, value }) {
      const key = round(moment(time, 'HH:mm:ss'), bucketSize).format('HH:mm')
      buckets[key] = buckets[key] || 0;
      buckets[key] += value;
      return buckets;
    }, {});

    const pointCount = moment.duration(1, 'day') / bucketSize;
    if (_.keys(bucketedSteps).length < pointCount) {
      for (let i = 0; i < pointCount; i++) {
        const key = moment().startOf('day').add(bucketSize * i).format('HH:mm');
        if (!bucketedSteps[key]) bucketedSteps[key] = 0
      }
    }

    const graphData = _.sortBy(_.toPairs(bucketedSteps), ([key]) => key).map(([x, y]) => ({ x, y }));
    const stepTotal = steps['activities-steps'][0].value;

    return (
      <div>
        <h3>Steps Taken</h3>
        <div>Step total: {stepTotal}</div>

        <VictoryChart
          domainPadding={{ x: 10 }}
          padding={{ top: 10, bottom: 30, left: 30, right: 20 }}
        >
          <VictoryAxis
            style={{
              ticks: { stroke: 'black', size: 3  },
              tickLabels: { fontSize: 8 }
            }}
            tickValues={['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']}
          />
          <VictoryAxis
            dependentAxis
            style={{
              ticks: { stroke: 'black', size: 3  },
              tickLabels: { fontSize: 8 },
              grid: {stroke: 'black'}
            }}
            tickValues={[0, 200, 400, 600, 800, 1000, 1200, 1400]}
          />
          <VictoryBar
            time={time}
            data={graphData}
            style={{
              data: {
                fill: (datum) => {
                  return +moment.duration(datum.x) === +time ? '#ff1d8e' : '#60bbb7';
                }
              }
            }}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onClick: (e, data) => {
                    this.props.changeTime(moment.duration(data.datum.x));
                  }
                }
              }
            ]}
          />
        </VictoryChart>
      </div>
    );
  }
}

export default FitbitStepGraph;
