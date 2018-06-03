import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import './stylesheet.css';

class NetflixViewing extends Component {
  getTimesAtHome() {
    const { date } = this.props;
    const currentDay = this.props.locations[date.format('x')];
    if (!currentDay) return [];

    let places = currentDay.Placemark;
    const previousDay = this.props.locations[date.clone().subtract(1, 'day').format('x')];
    if (previousDay) {
      const overlappingEvents = _.filter(previousDay.Placemark, (place) => {
        return date.isSame(moment(place.TimeSpan[0].begin[0]), 'day') || date.isSame(moment(place.TimeSpan[0].end[0]), 'day')
      });
      places = places.concat(overlappingEvents);
    }
    return  _.filter(places, (entry) => _.has(entry, 'Point') && entry.name[0] === 'Home');
  }

  renderList() {
    const { date, time, tickSize, data } = this.props;
    const viewing = data[date.format('x')];
    if (_.isUndefined(viewing)) return <div>Loading...</div>;
    if (_.isNull(viewing)) return <div>Nothing watched</div>;

    const timesAtHome = this.getTimesAtHome();

    return (
      <ul className='netflix-viewing__list'>
        {
          viewing.map(({ movieID, videoTitle, seriesTitle, episodeTitle, date, duration }) => {
            const startViewing = moment(date);
            const endViewing = startViewing.clone().add(duration * 0.98, 'seconds');
            const startOfDay = startViewing.clone().startOf('day');

            const viewingRange = moment.range(startViewing, endViewing);
            const reviewRange = moment.range(startOfDay.clone().add(time), startOfDay.clone().add(time.add(tickSize)));
            const isActive = viewingRange.overlaps(reviewRange);

            const isCorrectMatch = _.some(timesAtHome, (homeEvent) => {
              const timeAtHome = homeEvent.TimeSpan[0];
              const homeRange = moment.range(timeAtHome.begin[0], timeAtHome.end[0])
              return homeRange.contains(viewingRange);
            });

            const activeClass = isActive ? ' netflix-viewing__list__viewed-item--active' : '';
            const mismatchClass = !isCorrectMatch ? ' netflix-viewing__list__viewed-item--mismatch' : '';
            const eyeball = isActive ? ' 👁️ ' : '';

            const displayTitle = !seriesTitle ? videoTitle : `${seriesTitle} - ${episodeTitle}`;
            return (
              <li key={movieID} className={`netflix-viewing__list__viewed-item${activeClass}${mismatchClass}`}>
                {displayTitle} (@ {startViewing.format('HH:mm')} - {endViewing.format(`HH:mm`)}){eyeball}
              </li>
            );
          })
        }
      </ul>
    );
  }
  render() {
    return (
      <div className='netflix-viewing'>
        <h3>Netflix Viewing History</h3>
        {this.renderList()}
      </div>
    );
  }
}

export default NetflixViewing;
