import React, { Component } from 'react';
import { compose, withProps } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  KmlLayer,
} from 'react-google-maps';
import './stylesheets.css';

const MapWithAKmlLayer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(({ date, server, setLoading, setRef, onZoomChanged, zoom }) =>
  <GoogleMap
    options={{ maxZoom: 14 }}
    zoom={zoom}
    onZoomChanged={onZoomChanged}
    defaultCenter={{ lat: 54.5973, lng: -5.9301 }}
    ref={(ref) => setRef(ref)}
  >
    <KmlLayer
      url={`${server}/data/google-maps-visual-timeline/data/${date.format('YYYY')}/${date.format('MM')}/${date.format('DD')}/location.kml`}
      onStatusChanged={() => setLoading(false)}
    />
  </GoogleMap>
);

class GoogleMapsTimeline extends Component {
  state = {
    isLoading: true,
    zoom: 8
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.date.isSame(this.props.date)) {
      this.setState({ isLoading: true });
    }
  }

  setLoading = (isLoading) => {
    this.setState({ isLoading });
  }

  setRef = (ref) => {
    this.map = ref;
  }

  onZoomChanged = () => {
    const zoom = this.map.getZoom();
    this.setState({ zoom });
  }

  render() {
    return (
      <div className="maps-timeline">
        {this.state.isLoading && <div className="maps-timeline__loading">Loading ...</div>}
        <MapWithAKmlLayer
          date={this.props.date}
          server={this.props.server}
          setLoading={this.setLoading}
          zoom={this.state.zoom}
          onZoomChanged={this.onZoomChanged}
          setRef={this.setRef}
        />
      </div>
    );
  }
}

export default GoogleMapsTimeline;
