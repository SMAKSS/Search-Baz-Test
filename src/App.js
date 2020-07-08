import React, { useState, useRef } from 'react';

import LocalContext from "./contexts/LocalContext"
import Search from "./components/Search"
import Localization from "./components/Localization"
import './App.css';
import './localization/Rtl.css';
import './localization/Ltr.css';

/**
 * This module is a main wrapper for whole app.
 */
function App() {
  const local = useState({ local: "fa" })
  const container = useRef(null)

  return (
    <React.Suspense fallback={<></>}>
      <LocalContext.Provider value={local}>
        <div className="fa" ref={container}>
          <Search />
          <Localization container={container} />
        </div>
      </LocalContext.Provider>
    </React.Suspense>
  )
}

export default App;
