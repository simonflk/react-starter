import React from 'react';
import {render} from 'react-dom';

import './index.css';

function App() {
    return <h1>react starter</h1>;
}

render(<App />, document.getElementById('app'));

console.log(`VERSION: ${__VERSION__}\nCOMMITHASH: ${__COMMITHASH__}\nBRANCH: ${__BRANCH__}`);
