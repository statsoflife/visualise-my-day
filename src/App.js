import React, { Component } from 'react';
import moment from 'moment';
import DailyFeeling from './components/daily-feeling';
import GoogleMapsTimeline from './components/google-maps-timeline';
import NetflixViewing from './components/netflix-viewing';
import FitbitStepGraph from './components/fitbit-step-graph';
import FitbitHeartGraph from './components/fitbit-heart-graph';
import './App.css';

const server = 'https://yellow-fireant-33.localtunnel.me';

class App extends Component {
  state = {
    date: moment().format('YYYY-MM-DD'),
    netflixViewing: {},
    fitbitSteps: {},
    fitbitHeart: {},
  }

  getData(date = moment(this.state.date)) {
    this.getNetfixViewing(date);
    this.getFitbitSteps(date);
    this.getFitbitHeart(date);
  }

  componentDidMount() {
    this.getDailyFeeling()
    this.getData()
  }

  getDailyFeeling = () => {
    fetch('/data/daily-feeling/data/daily-feeling.json')
      .then((response) => response.json())
      .then((dailyFeelings) => this.setState({ dailyFeelings }));
  }

  getNetfixViewing = (date) => {
    if (this.state.netflixViewing[date.format('x')]) return;

    fetch(`/data/netflix/data/${date.format('YYYY')}/${date.format('MM')}/${date.format('DD')}/viewing-activity.json`)
      .then((response) => response.json())
      .then((netflixViewing) => this.setState({
        netflixViewing: Object.assign(this.state.netflixViewing, { [date.format('x')]: netflixViewing })
      }))
      .catch(() => {});
  }

  getFitbitSteps = (date) => {
    if (this.state.fitbitSteps[date.format('x')]) return;

    fetch(`/data/fitbit/data/${date.format('YYYY')}/${date.format('MM')}/${date.format('DD')}/steps.json`)
      .then((response) => response.json())
      .then(({ data }) => this.setState({
        fitbitSteps: Object.assign(this.state.fitbitSteps, { [date.format('x')]: data })
      }))
      .catch(() => {});
  }

  getFitbitHeart = (date) => {
    if (this.state.fitbitHeart[date.format('x')]) return;

    fetch(`/data/fitbit/data/${date.format('YYYY')}/${date.format('MM')}/${date.format('DD')}/heart.json`)
      .then((response) => response.json())
      .then(({ data }) => this.setState({
        fitbitHeart: Object.assign(this.state.fitbitHeart, { [date.format('x')]: data })
      }))
      .catch(() => {});
  }

  changeDay = (date) => {
    this.getData(date);
    this.setState({
      date: date.format('YYYY-MM-DD')
    });
  }

  subtractDay = () => {
    this.changeDay(moment(this.state.date).subtract(1, 'day'));
  }

  addDay = () => {
    this.changeDay(moment(this.state.date).add(1, 'day'));
  }

  render() {
    const date = moment(this.state.date);

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">{
            date.format('dddd Do MMMM YYYY')
          }</h1>
          <div>
            <button onClick={this.subtractDay}>&lt; back 1 day</button>
            <button onClick={this.addDay}>forward 1 day &gt;</button>
          </div>
        </header>
        <DailyFeeling date={date} data={this.state.dailyFeelings} />
        <GoogleMapsTimeline date={date} server={server} />
        <NetflixViewing date={date} data={this.state.netflixViewing} />
        <FitbitStepGraph date={date} data={this.state.fitbitSteps} />
        <FitbitHeartGraph date={date} data={this.state.fitbitHeart} />
      </div>
    );
  }
}

export default App;
