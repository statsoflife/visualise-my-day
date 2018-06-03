import React, { Component } from 'react';
import { compose, withProps } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  KmlLayer,
} from 'react-google-maps';

const MapWithAKmlLayer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(({ date, server }) =>
  <GoogleMap
    defaultZoom={12}
    defaultCenter={{ lat: 54.5973, lng: -5.9301 }}
  >
    <KmlLayer
      url={`${server}/data/google-maps-visual-timeline/data/${date.format('YYYY')}/${date.format('MM')}/${date.format('DD')}/location.kml`}
      options={{ preserveViewport: true }}
    />
  </GoogleMap>
);

class GoogleMapsTimeline extends Component {
  render() {
    return (
      <div>
        <MapWithAKmlLayer
          date={this.props.date}
          server={this.props.server}
        />
      </div>
    );
  }
}

export default GoogleMapsTimeline;
