import React, { Component } from 'react';
import moment from 'moment';
import './stylesheet.css';

class DailyFeeling extends Component {
  render() {
    const { date, data } = this.props;
    if (!data) return null;

    const dailyFeeling = data.find(({ timestamp }) => moment(timestamp).isSame(date, 'day'))
    if (!dailyFeeling) return <div className="daily-feeling--missing">Not yet logged</div>;

    if (dailyFeeling.status > 0) return <div className="daily-feeling--good">Good</div>;
    if (dailyFeeling.status < 0) return <div className="daily-feeling--bad">Bad</div>;
    return <div className="daily-feeling--neutral">Neutral</div>;
  }
}

export default DailyFeeling;
