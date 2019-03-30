import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Rank from "./components/Rank/Rank";
import Particles from "react-particles-js";
import Clarifai from "clarifai";
import keys from "./keys";
import "./App.css";

const app = new Clarifai.App({
  apiKey: keys.apiKey
});

const particlesOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: [],
      route: "signin",
      isSignedIn: false,
      reCaptcha: false
    };
  }

  calculateFaceLocation = data => {
    const arrayLength = data.outputs[0].data.regions;
    const faces = [];
    let coordinates = [];
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    for (var i = 0; i < arrayLength.length; i++) {
      faces.push(arrayLength[i].region_info.bounding_box);
    }

    for (var j = 0; j < faces.length; j++) {
      let face = {
        leftCol: faces[j].left_col * width,
        topRow: faces[j].top_row * height,
        rightCol: width - faces[j].right_col * width,
        bottomRow: height - faces[j].bottom_row * height
      };
      coordinates.push(face);
    }
    return coordinates;
  };

  displayFaceBox = box => {
    this.setState({ box: box });
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => console.log(err));
  };

  onRouteChange = route => {
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }

    this.setState({ route: route, reCaptcha: false });
  };

  onReCaptchaChange = () => {
    this.setState({ reCaptcha: true });
    console.log(this.state.reCaptcha);
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <Signin
            onRouteChange={this.onRouteChange}
            onReCaptchaChange={this.onReCaptchaChange}
            reCaptcha={this.state.reCaptcha}
          />
        ) : (
          <Register
            onRouteChange={this.onRouteChange}
            onReCaptchaChange={this.onReCaptchaChange}
            reCaptcha={this.state.reCaptcha}
          />
        )}
      </div>
    );
  }
}

export default App;
