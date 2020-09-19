import React, { useContext, useEffect } from 'react';

import LocalContext from '../contexts/LocalContext';

/**
 *
 * @param {Object} container - container division reference
 * This method is responsible for handling localization status and its buttons.
 */
function Localization({ container }) {
  const [local, setLocal] = useContext(LocalContext);

  /**
   *
   * @param {Object} event -  event interface for localization buttons
   * This function is reponsible for handling localization values.
   */
  const localHandler = (event) => {
    event.preventDefault();
    const localValue = event.target.value;
    if (localValue !== local.local) {
      setLocal({ local: localValue });
      container.current.className = localValue;
      document.querySelector('html').setAttribute('lang', localValue);
      localStorage.setItem('local', JSON.stringify(localValue));
    }
  };

  /**
   * This useEffect hook is responsible for getting localization value from localstorage.
   */
  useEffect(() => {
    localStorage.getItem('local') !== null &&
      setLocal({ local: JSON.parse(localStorage.getItem('local')) });
  }, [setLocal]);

  return (
    <div className='localization'>
      <div className='button-wrapper'>
        <button
          onClick={(event) => localHandler(event)}
          value='fa'
          aria-label={'persian'}
        >
          فارسـی
        </button>
        <button
          onClick={(event) => localHandler(event)}
          value='en'
          aria-label={'english'}
        >
          English
        </button>
      </div>
    </div>
  );
}

export default Localization;
