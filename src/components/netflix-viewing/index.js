import React, { Component } from 'react';
import moment from 'moment';

class NetflixViewing extends Component {
  render() {
    const { date, data } = this.props;
    const viewing = data[date.format('x')];
    if (!viewing) return <div>Nothing watched</div>;

    return (
      <div>
        <ul>
          {
            viewing.map(({ movieID, videoTitle, seriesTitle, episodeTitle, date }) => {
              const time = moment(date).format('HH:mm');
              if (!seriesTitle) return <li key={movieID}>{videoTitle} (@ {time})</li>;
              return <li key={movieID}>{seriesTitle} - {episodeTitle} (@ {time})</li>;
            })
          }
        </ul>
      </div>
    );
  }
}

export default NetflixViewing;
