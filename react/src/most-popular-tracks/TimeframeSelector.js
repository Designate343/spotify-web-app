import React from 'react';
import './../index.css';

class TimeframeSelector extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div>
                <select class="timerange-dropdown-select" value={this.props.timeframe} onChange={this.props.onTimeframeSelect}>
                    <option disabled value="">Please select a timeframe</option>
                    <option>short_term</option>
                    <option>medium_term</option>
                    <option>long_term</option>
                </select>
            </div>
        );
    }
}

export default TimeframeSelector;
