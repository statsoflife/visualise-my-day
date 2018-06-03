import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import './stylesheet.css';

const sanitisation = {
  // Insert location names to change in UI
};

const prefixes = {
  'home': '🏠',
  'work': '👨‍💻',
  'caffè nero': '☕',
  'vietnamese coffee': '☕',
  'sakura': '🍣',
  'movie house': '🎬',
  'comic book guys': '💬',
  'forestside': '🛒',
  'airport': '✈️'
};

const ignoreList = {
  'Driving': true,
  'Belfast': true
}

class TimelineSummary extends Component {
  render() {
    const { date, time, tickSize, data } = this.props;
    const timeline = data[date.format('x')];
    if (_.isUndefined(timeline)) return <div>Loading...</div>;
    if (_.isNull(timeline)) return <div>No timeline data</div>;

    const places = _.reduce(
      _.filter(timeline.Placemark, (entry) => _.has(entry, 'Point') && !ignoreList[entry.name[0]]),
      function(uniquePlaces, place) {
        const key = place.name[0];
        uniquePlaces[key] = (uniquePlaces[key] || []).concat(place);
        return uniquePlaces;
      }
      , {}
    );

    const transitTotals = _.reduce(
      _.filter(timeline.Placemark, (entry) => !_.has(entry, 'Point')),
      function(totaledValues, movement){
        const key = movement.name[0];
        totaledValues[key] = totaledValues[key] || { time: 0, distance: 0, count: 0 };
        totaledValues[key].time += moment(movement.TimeSpan[0].end[0]).diff(moment(movement.TimeSpan[0].begin[0]));
        totaledValues[key].distance += parseInt(movement.ExtendedData[0].Data[2].value[0], 10);
        totaledValues[key].count++;
        return totaledValues;
      },
      {}
    );

    return (
      <div className='timeline-summary'>
        <h3>Timeline Summary</h3>

        <div className='timeline-summary__places'>
          {_.map(places, (placeEvents) => {
            const [{ name: [name], Point: [{coordinates}] }] = placeEvents;
            const displayName = sanitisation[name] || name;
            if (/^\d+/.test(displayName)) {
              console.log("Location omitted as potential address", displayName);
              return null;
            }

            const isActive = _.some(placeEvents, (placeEvent) => {
              const timeAtPlace = placeEvent.TimeSpan[0];
              const presentRange = moment.range(timeAtPlace.begin[0], timeAtPlace.end[0])
              const reviewRange = moment.range(moment(date).add(time), moment(date).add(time.add(tickSize)));
              return presentRange.overlaps(reviewRange);
            });

            const enhancedDisplayName = _.reduce(prefixes, function(name, prefix, match) {
              if (name.toLowerCase().includes(match)) return `${prefix} ${name}`;
              return name;
            }, displayName);

            const activeClass = isActive ? ' timeline-summary__places__place--active' : '';
            const pushpin = isActive ? ' 📍 ' : '';

            return (
              <div key={coordinates[0]} className={`timeline-summary__places__place${activeClass}`}>
                {enhancedDisplayName}{pushpin}
              </div>
            );
          })}
        </div>

        <div>
          {_.toPairs(transitTotals).map(([method, { distance, time, count }]) => (
            <div key={method}>
              <h4>{method}{count > 1 ? ` (${count} times)` : ''}</h4>
              <ul>
                <li>
                  Distance: {Math.round(distance * 0.000621 * 100) / 100} miles
                </li>
                <li>
                  Time: {moment.duration(time).humanize()}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default TimelineSummary;
