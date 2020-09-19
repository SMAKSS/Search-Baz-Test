import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback
} from 'react';

import LocalContext from '../contexts/LocalContext';
import { general } from '../localization/Dictionary';

/**
 * Search module is responsible for search bar and all of its responsibility
 */
function Search() {
  const timeOutDelay = process.env.REACT_APP_Delay;
  const searchURL = process.env.REACT_APP_URL;
  const imageURL = process.env.REACT_APP_IMAGE_URL;
  const searchBar = useRef(null);
  const snackBar = useRef(null);
  const [local] = useContext(LocalContext);
  const [state, setState] = useState({
    searchText: '',
    requestData: null,
    error: false,
    errorContent: '',
    retryCount: 0,
    mostSearchedFor: ['phone', 'laptop', 'accessories']
  });

  /**
   *
   * @param {Object} event - event interface of an search bar text change
   * This function will fire on search bar onchange event.
   */
  const search = (event) => {
    event.persist();
    setState((prevStates) => ({
      ...prevStates,
      searchText: event?.target?.value
    }));
  };

  /**
   *
   * @param {Number} page - result page
   * @param {Number} perPage - result per page
   * @param {String} sort - page sort
   * @param {String} text - keyword for search
   * @param {Number} width - width of image
   * @param {Number} height - height of image
   * This function is responsible for making call to the search API and then set the results into our states.
   * NOTE: The media API call is getting cors, so there is no possible way to show images, we just used no-corse header to prevent getting errors.
   */
  const apiCall = useCallback(
    ({
      page = 1,
      perPage = 8,
      sort = 'asc',
      text = '',
      width = 500,
      height = 625
    }) => {
      fetch(
        `${searchURL}?page=${page}&perPage=${perPage}&sort[price][eq]=${sort}&keyword=${text}`
      )
        .then((response) =>
          response.ok
            ? response.json()
            : response.text().then((text) => {
                setState((prevStates) => ({
                  ...prevStates,
                  error: true,
                  errorContent: text
                }));
              })
        )
        .then(async (data) => {
          const list = [...data?.content?.data?.list];
          const length = list.length;
          for (let i = 0; i < length; ++i) {
            await fetch(
              `${imageURL}?width=${width}&height=${height}&file=${
                list[i].sourceMedia[0].url.split('.com/')[1]
              }`
            )
              .then((response) => response.blob())
              .then((image) => {
                list[i].imageURL = URL.createObjectURL(image);
              })
              .catch((error) => {
                console.error(error);
              });
          }

          setState((prevStates) => ({ ...prevStates, requestData: list }));
        });
    },
    [searchURL, imageURL]
  );

  /**
   * This function is responsible for clearing search bar text.
   */
  const clearSearch = () => {
    setState((prevStates) => ({
      ...prevStates,
      searchText: '',
      requestData: null
    }));
  };

  /**
   *
   * @param {Object} event - event interface for click actions in the page
   * This function is responsible for closing and opening the search results.
   */
  const searchBarController = (event) => {
    event.target.classList.contains('container')
      ? searchBar.current.classList.remove('active')
      : !searchBar.current.classList.contains('active') &&
        searchBar.current.classList.add('active');
  };

  /**
   * This useEffect hook is responsible for call apiCall function when the timeOutDelay get exhausted.
   */
  useEffect(() => {
    !state.searchText &&
      setState((prevStates) => ({ ...prevStates, requestData: null }));
    const timeOut = state.searchText
      ? setTimeout(() => apiCall({ text: state.searchText }), timeOutDelay)
      : null;
    return () => clearTimeout(timeOut);
  }, [state.searchText, timeOutDelay, apiCall]);

  /**
   * This useEffect hook is responsible for showing error snacks.
   */
  useEffect(() => {
    if (state.error) {
      console.error(state.errorContent);
      snackBar.current.innerHTML = state.errorContent;
      snackBar.current.classList.add('show');
      const timeOut = setTimeout(
        () => snackBar.current.classList.remove('show'),
        3000
      );
      return () => clearTimeout(timeOut);
    }
  }, [state.error, state.errorContent, state.searchText]);

  return (
    <div className='container' onClick={(event) => searchBarController(event)}>
      <div
        ref={searchBar}
        className={state.searchText ? 'active search-bar' : 'search-bar'}
      >
        <span
          className={state.searchText ? 'clear-search' : 'd-none'}
          onClick={() => clearSearch()}
        ></span>
        <input
          type='text'
          onChange={(event) => search(event)}
          value={state.searchText}
          placeholder={`${general[local.local].search}...`}
          aria-label={'search'}
        />
        <div className='search-results'>
          <ul className='search-results-list'>
            {state.requestData ? (
              state.requestData.map((result, index) => {
                return (
                  <li className='result-row' key={index}>
                    <a
                      href={result.productId}
                      onClick={(event) => event.preventDefault()}
                    >
                      <span
                        className='result-image'
                        style={{ backgroundImage: `url("${result.imageURL}")` }}
                      ></span>
                      <span className='result-title'>
                        {result.title[local.local]
                          ? result.title[local.local]
                          : result.title.fa}{' '}
                        <span>{general[local.local].by}</span>
                      </span>
                      <span className='result-shop-info'>
                        {result.sellerInfo.shopDisplayName}
                      </span>
                    </a>
                  </li>
                );
              })
            ) : (
              <div className='search-result-default'>
                <h6>{general[local.local].mostSearchedFor}:</h6>
                <ul className='default-list'>
                  {state.mostSearchedFor.map((item, index) => {
                    return <li key={index}>{item}</li>;
                  })}
                </ul>
              </div>
            )}
            {state.requestData?.length === 0 ? (
              <li className='show-all-results'>
                <a
                  href={state.searchText}
                  onClick={(event) => event.preventDefault()}
                >
                  <span>
                    {general[local.local].showAllResults}{' '}
                    <span className='search-text'>{state.searchText}</span>
                  </span>
                </a>
              </li>
            ) : (
              ''
            )}
          </ul>
        </div>
      </div>
      <div className='snack-bar' ref={snackBar}></div>
    </div>
  );
}

export default Search;
