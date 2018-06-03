import React, { Component } from 'react';
import moment from 'moment';
import './stylesheet.css';

const getDisplay = function(status) {
  switch (status) {
    case 1:
      return { feeling: 'good', emoji: '😊' };
    case -1:
      return { feeling: 'bad', emoji: '😟' };
    case 0:
      return { feeling: 'neutral', emoji: '😐' };
    default:
      return { feeling: 'unknown', emoji: '❓' };
  }
};

class DailyFeeling extends Component {
  render() {
    const { date, data } = this.props;
    if (!data) return null;

    const dailyFeeling = data.find(({ timestamp }) => moment(timestamp).isSame(date, 'day'))
    if (!dailyFeeling) return (
      <div className="daily-feeling daily-feeling--missing">
        Status not logged
      </div>
    );

    const { feeling, emoji } = getDisplay(dailyFeeling.status);
    return <div className={`daily-feeling daily-feeling--${feeling}`}>{emoji}</div>
  }
}

export default DailyFeeling;
