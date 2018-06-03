import React, { Component } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar, VictoryLine } from 'victory';
import _ from 'lodash';
import moment from 'moment';

function round(date, duration) {
  return moment(Math.floor((+date) / (+duration)) * (+duration));
}

class FitbitHeartGraph extends Component {
  render() {
    const { date, time, data } = this.props;
    const heart = data[date.format('x')];
    if (_.isUndefined(heart)) return <div>Loading...</div>;
    if (_.isNull(heart)) return <div>No heart data logged</div>;

    const bucketSize = moment.duration(10, 'minutes');
    const bucketedHeart = heart['activities-heart-intraday'].dataset.reduce(function(buckets, { time, value }) {
      const key = round(moment(date).add(moment.duration(time)), bucketSize).format('HH:mm')
      buckets[key] = buckets[key] || [];
      buckets[key].push(value);
      return buckets;
    }, {});

    const pointCount = moment.duration(1, 'day') / bucketSize;
    if (_.keys(bucketedHeart).length < pointCount) {
      for (let i = 0; i < pointCount; i++) {
        const key = moment().startOf('day').add(bucketSize * i).format('HH:mm');
        if (!bucketedHeart[key]) bucketedHeart[key] = [0]
      }
    }

    const graphData = _.sortBy(_.toPairs(bucketedHeart), ([key]) => key).map(([x, y]) => ({
      x,
      y: Math.round(_.mean(y) * 10) / 10
    }));
    const { restingHeartRate } = heart['activities-heart'][0].value;

    return (
      <div>
        <h3>Heart Rate</h3>
        <div>Resting heart rate: {restingHeartRate}</div>

        <VictoryChart
          domainPadding={{ x: 10 }}
          padding={{ top: 10, bottom: 30, left: 30, right: 20 }}
        >
          <VictoryAxis
            style={{
              ticks: { stroke: 'black', size: 3 },
              tickLabels: { fontSize: 8 }
            }}
            tickValues={['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']}
          />
          <VictoryAxis
            dependentAxis
            style={{
              ticks: { stroke: 'black', size: 3 },
              tickLabels: { fontSize: 8 },
              grid: { stroke: 'black' }
            }}
            tickValues={[0, 20, 40, 60, 80, 100, 120]}
          />
          <VictoryBar
            time={time}
            alignment='start'
            style={{
              data: {
                fill: (datum) => {
                  return +moment.duration(datum.x) === +time ? '#ff1d8e' : '#f8aa27';
                }
              }
            }}
            data={graphData}
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
          <VictoryLine
            data={_.map(graphData, ({ x }) => ({ x, y: restingHeartRate }))}
            labels={(point) => (point.x === '04:00') ? 'Resting rate' : undefined}
            standalone={false}
            style={{
              data: { stroke: '#e95f46', strokeWidth: 1, opacity: 0.7 },
              labels: { fontSize: 10, fill: '#e95f46', padding: 1 }
            }}
          />
        </VictoryChart>
      </div>
    );
  }
}

export default FitbitHeartGraph;
