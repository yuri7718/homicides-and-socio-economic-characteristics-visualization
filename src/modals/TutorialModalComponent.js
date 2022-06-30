import React from 'react'
import DemoModal from './DemoModal.js'

class TutorialModalComponent extends React.Component {

    constructor(props) {
        super(props);
    }
    render() {     

        return (
            <div>
                <h1>Hello!</h1>
                <h3>Welcome to our Data Visualization about the Homicides and Socioeconomic Characteristics
                    in United States from 1960 to 1990.
                </h3>
                <div>If you want, you can checkout the <strong /> "Demo" button to learn more about the functionalities.</div>
                <DemoModal />
            </div>
        )
    }
}

export default TutorialModalComponent;
