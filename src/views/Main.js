import fetch from 'isomorphic-fetch';
import React from 'react';
import InlineCss from 'react-inline-css';
import Transmit from 'react-transmit';

/**
 * Main React application entry-point for both the server and client.
 */
class Main extends React.Component {
  /**
   * Runs on server and client.
   */
  componentWillMount() {
    if (__SERVER__) {
      /**
       * This is only run on the server, and will be removed from the client build.
       */
      console.log('Hello server');
    }
    if (__CLIENT__) {
      /**
       * This is only run on the client.
       */
      console.log('Hello client');
      /**
       * Recursive function to transmit the rest of the stargazers on the client.
       */
      const transmitRemainingStargazers = () => {
        if (!this.props.queryParams.pagesToFetch > 0) {
          return;
        }
        this.props.setQueryParams({
          prevStargazers: this.props.allStargazers,
          nextPage: this.props.queryParams.nextPage + 1,
          pagesToFetch: this.props.queryParams.pagesToFetch - 1
        }).then(transmitRemainingStargazers);
      };
      transmitRemainingStargazers();
    }
  }
  /**
   * Runs on server and client.
   */
  render() {
    const repositoryUrl = 'https://github.com/RickWong/react-isomorphic-starterkit';
    const avatarSize    = 32;
    const avatarUrl     = (id) => `https://avatars.githubusercontent.com/u/${id}?v=3&s=${avatarSize}`;

    /**
     * This is a Transmit prop. See below for its query.
     */
    const stargazers = this.props.allStargazers;

    return (
      <InlineCss stylesheet={Main.css(avatarSize)} namespace='Main'>
        <a className='github' href={repositoryUrl}>
          <img src='https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67' alt='Fork me on GitHub'/>
        </a>
        <h1>
          <img src='/favicon.ico' alt='icon'/>
          <br/> Welcome to React Isomorphic Starterkit.
        </h1>
        <h3>Features</h3>
        <ul>
          <li>Fully automated with npm run scripts</li>
          <li>Server hot reloads with piping and Hapi.js</li>
          <li>Webpack for watch + production builds</li>
          <li>React.js + Router on the client and server</li>
          <li>React Hot Loader for instant client updates</li>
          <li>Babel.js automatically compiles ES6 + ES7</li>
          <li>React Transmit to preload on server to client</li>
          <li>InlineCss-component for styling components</li>
        </ul>
        <p>
          In short – <em>an excellent choice</em>.
          Ready to start{'?'}
        </p>
        <h3>Community</h3>
        <p>
          <a href={repositoryUrl} title='you here? star us!'>
            {stargazers.map((user) => {
              return (
                <img key={user.id} className='avatar' src={avatarUrl(user.id)}
                     title={user.login} alt={user.login} />
              );
            })}
            <img className='avatar' src={avatarUrl(0)} alt='you?'/>
          </a>
        </p>
      </InlineCss>
    );
  }
  /**
   * <InlineCss> component allows you to write a CSS stylesheet for your component. Target
   * your component with `&` and its children with `& selectors`. Be specific.
   */
  static css(avatarSize) {
    return (`
      & .github {
        position: absolute;
        top: 0;
        right: 0;
        border: 0;
      }
      & {
        font-family: sans-serif;
        color: #0df;
        padding: 10px 30px 30px;
        width: 380px;
        margin: 10px auto;
        background: #222;
      }
      & .avatar {
        border-radius: 50%;
        width: ${avatarSize}px;
        height: ${avatarSize}px;
        margin: 0 2px 2px 0;
      }
    `);
  }
}

/**
 * Use Transmit to query and return GitHub stargazers as a Promise.
 */
export default Transmit.createContainer(Main, {
  queryParams: {
    prevStargazers: [],
    nextPage: 1,
    pagesToFetch: 10
  },
  queries: {
    /**
     * Return a Promise of the previous stargazers + the newly fetched stargazers.
     */
    allStargazers(queryParams) {
      /**
       * On the server, connect to GitHub directly.
       */
      let githubApi = 'https://api.github.com';

      /**
       * On the client, connect to GitHub via the Hapi proxy route.
       */
      // if (__CLIENT__) {
      // 	const {hostname, port} = window.location;
      // 	githubApi = `http://${hostname}:${port}/api/github`;
      // }

      /**
       * Load a few stargazers using the Fetch API.
       */
      return fetch(
        githubApi + '/repos/RickWong/react-isomorphic-starterkit/stargazers' +
        `?per_page=100&page=${queryParams.nextPage}`
      ).then((response) => response.json()).then((body) => {
        /**
         * Stop fetching if the response body is empty.
         */
        if (!body || !body.length) {
          queryParams.pagesToFetch = 0;
          return queryParams.prevStargazers;
        }
        /**
         * Pick id and username from fetched stargazers.
         */
        const fechedStargazers = body.map(({id, login}) => ({id, login}));
        return queryParams.prevStargazers.concat(fechedStargazers);
      });
    }
  }
});
