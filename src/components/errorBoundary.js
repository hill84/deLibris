import React from 'react';
import { icon } from '../config/icons';

export default class ErrorBoundary extends React.Component {
  state = { 
    error: null, 
    errorInfo: null 
  };
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log error messages to an error reporting service here
  }
  
  render() {
    const { error, errorInfo } = this.state;

    if (errorInfo) {
      return (
        <div className="container empty" id="errorBoundaryComponent">
          <div className="card dark empty shake reveal">
            <div className="text-center">
              <div className="circle-icon popIn reveal">{icon.alert()}</div>
              <h1>Qualcosa è andato storto</h1>
              <p>Tranquillo, non è colpa tua... <a href="/">Torna alla home</a> per proseguire. Se hai bisogno di aiuto scrivi a <a href="mailto:info@biblo.space">info@biblo.space</a>.</p>
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary className="btn flat rounded">Dettagli per nerd</summary>
                <h2>{error && error.toString()}</h2>
                {errorInfo.componentStack}
              </details>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }  
}