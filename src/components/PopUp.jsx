import React from 'react';
import ReactDOM from 'react-dom';
import theme from '../theme';

let styles = {
    root: {
        top: 0,
	    left: 0,
	    width: "100%",
	    height: "100%",
	    display: "flex",
	    zIndex: 1300,
	    position: "fixed",
	    alignItems: "flex-start",
	    justifyContent: "center"
    },
    backdrop: {
    	top: 0,
	    left: 0,
	    width: "100%",
	    height: "100%",
	    zIndex: -1,
	    position: "fixed",
	    backgroundColor: "rgba(0, 0, 0, 0.5)",
	    "-webkit-tap-highlight-color": "transparent",
    }
};

class PopUp extends React.Component {
	portalElement = null;
	constructor(props) {
        super(props);

    }
	componentDidMount() {
		if (this.props.open) {
			let p = document.createElement('div');
			document.body.appendChild(p);
			this.portalElement = p;
			this.componentDidUpdate();
		} else {
			document.body.removeChild(this.portalElement);
		}
		
	}
	componentWillUnmount() {
		document.body.removeChild(this.portalElement);
	}
	componentDidUpdate() {
		ReactDOM.render(<div style={styles.root} {...this.props}><div style={styles.backdrop}></div><div>{this.props.children}</div></div>, this.portalElement);
	}

    render() {
    	return null;
    }
}

export default PopUp;
