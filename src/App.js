import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import xmlParser from 'xml2js';
import Slider, { createSliderWithTooltip } from 'rc-slider';

import DailyFeeling from './components/daily-feeling';
import GoogleMapsTimeline from './components/google-maps-timeline';
import NetflixViewing from './components/netflix-viewing';
import TimelineSummary from './components/timeline-summary';
import FitbitStepGraph from './components/fitbit-step-graph';
import FitbitHeartGraph from './components/fitbit-heart-graph';

import "react-datepicker/dist/react-datepicker.css";
import 'rc-slider/assets/index.css';
import './App.css';

const server = 'http://localhost';

const moment = extendMoment(Moment);
const tickSize = moment.duration(10, 'minutes');
const sliderMax = (moment.duration(1, 'day') / tickSize) - 1;
const getDurationFor = (sliderValue) => moment.duration(sliderValue * tickSize);
const formatDuration = (duration) => moment.utc().startOf('day').add(duration).format('HH:mm');
const getDatePathFor = (date) => `${date.format('YYYY')}/${date.format('MM')}/${date.format('DD')}`;
const SliderWithTooltip = createSliderWithTooltip(Slider);

let animationInterval;

class App extends Component {
  state = {
    isPlaying: false,
    date: moment().format('YYYY-MM-DD'),
    time: '00:00',
    netflixViewing: {},
    fitbitSteps: {},
    fitbitHeart: {},
    visualTimeline: {}
  }

  componentDidMount() {
    this.getAllDailyFeelings()
    this.getDayData();
  }

  getDayData(date = moment(this.state.date)) {
    this.getNetfixViewing(date);
    this.getFitbitSteps(date);
    this.getFitbitHeart(date);
    this.getVisualTimeline(date);
    this.getVisualTimeline(date.clone().subtract(1, 'day'));
  }

  getAllDailyFeelings = () => {
    fetch('/data/daily-feeling/data/daily-feeling.json')
      .then((response) => response.json())
      .then((dailyFeelings) => this.setState({ dailyFeelings }));
  }

  updateDateBasedState = (key, value, date) => {
    this.setState({
      [key]: Object.assign(this.state[key], { [date.format('x')]: value })
    })
  }

  getVisualTimeline = (date) => {
    const key = 'visualTimeline';
    if (this.state[key][date.format('x')]) return;

    fetch(`/data/google-maps-visual-timeline/data/${getDatePathFor(date)}/location.kml`)
      .then(response => response.text())
      .then((response) => {
        return new Promise(function(resolve, reject) {
          xmlParser.parseString(response, function (err, result) {
            if (err) return reject(err);
            return resolve(result.kml.Document[0]);
          });
        });
      })
      .then((responseData) => this.updateDateBasedState(key, responseData, date))
      .catch(() => this.updateDateBasedState(key, null, date));
  }

  getNetfixViewing = (date) => {
    const key = 'netflixViewing';
    if (this.state[key][date.format('x')]) return;

    fetch(`/data/netflix/data/${getDatePathFor(date)}/viewing-activity.json`)
      .then((response) => response.json())
      .then((responseData) => this.updateDateBasedState(key, responseData, date))
      .catch(() => this.updateDateBasedState(key, null, date));
  }

  getFitbitSteps = (date) => {
    const key = 'fitbitSteps';
    if (this.state[key][date.format('x')]) return;

    fetch(`/data/fitbit/data/${getDatePathFor(date)}/steps.json`)
      .then((response) => response.json())
      .then(({ data }) => this.updateDateBasedState(key, data, date))
      .catch(() => this.updateDateBasedState(key, null, date));
  }

  getFitbitHeart = (date) => {
    const key = 'fitbitHeart';
    if (this.state[key][date.format('x')]) return;

    fetch(`/data/fitbit/data/${getDatePathFor(date)}/heart.json`)
      .then((response) => response.json())
      .then(({ data }) => this.updateDateBasedState(key, data, date))
      .catch(() => this.updateDateBasedState(key, null, date));
  }

  changeSliderTime = (sliderValue) => {
    this.changeTime(getDurationFor(sliderValue));
  }

  changeTime = (time, isPlaying = false) => {
    this.setState({ isPlaying, time: formatDuration(time) });
  }

  changeDay = (date) => {
    clearInterval(animationInterval);
    this.getDayData(date);
    this.setState({ isPlaying: false, date: date.format('YYYY-MM-DD') });
  }

  subtractDay = () => {
    this.changeDay(moment(this.state.date).subtract(1, 'day'));
  }

  addDay = () => {
    this.changeDay(moment(this.state.date).add(1, 'day'));
  }

  animate = () => {
    if (this.state.isPlaying) clearInterval(animationInterval);
    if (!this.state.isPlaying) {
      animationInterval = setInterval(() => {
        if (+moment.duration(this.state.time).add(tickSize) >= +moment.duration(1, 'day')) {
          clearInterval(animationInterval);
          this.changeTime(moment.duration('00:00'));
        } else {
          this.changeTime(moment.duration(this.state.time).add(tickSize), this.state.isPlaying);
        }
      }, 200);
    }
    this.setState({ isPlaying: !this.state.isPlaying });
  }

  render() {
    const date = moment(this.state.date);
    const time = moment.duration(this.state.time);

    const sliderValue = time / tickSize;

    return (
      <div className="visualise-data">
        <header className="visualise-data__header">
          <h1>{date.format('dddd Do MMMM YYYY')} @ {this.state.time}</h1>
          <div className="visualise-data__daily-feeling">
            <DailyFeeling date={date} data={this.state.dailyFeelings} />
          </div>
          <div className="visualise-data__header__date-selection">
            <button onClick={this.subtractDay}>-1 day</button>
            <div className="visualise-data__header__date-selection__date-picker">
              <DatePicker
                selected={date}
                onChange={this.changeDay}
              />
            </div>
            <button onClick={this.addDay}>+1 day</button>
          </div>
          <div style={{ float: 'right' }}>
            <button onClick={this.animate}>
              {this.state.isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
          <div style={{padding: '1em'}}>
            <SliderWithTooltip
              min={0}
              max={sliderMax}
              value={sliderValue}
              tipFormatter={(value) => formatDuration(getDurationFor(value))}
              onChange={this.changeSliderTime}
            />
          </div>
        </header>

        <div className="visualise-data__content">
          <div className="visualise-data__netflix-viewing">
            <NetflixViewing date={date.clone()} time={time.clone()} tickSize={tickSize} data={this.state.netflixViewing} locations={this.state.visualTimeline} />
          </div>

          <div className="visualise-data__timeline">
            <div className="visualise-data__timeline__map">
              <GoogleMapsTimeline date={date.clone()} server={server} />
            </div>
            <div className="visualise-data__timeline__summary">
              <TimelineSummary date={date.clone()} time={time.clone()} tickSize={tickSize} data={this.state.visualTimeline} />
            </div>
          </div>
          <div className="visualise-data__fitbit">
            <div className="visualise-data__fitbit__step-graph">
              <FitbitStepGraph date={date.clone()} time={time.clone()} data={this.state.fitbitSteps} changeTime={this.changeTime} />
            </div>
            <div className="visualise-data__fitbit__heart-graph">
              <FitbitHeartGraph date={date.clone()} time={time.clone()} data={this.state.fitbitHeart} changeTime={this.changeTime} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
