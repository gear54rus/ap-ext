import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';

import { storage, capitalize } from 'util/util';
import { POPUP_PORT } from 'util/constants';

import './index.scss';

const { tabs, runtime } = chrome;

function SiteList(props) {
  const { sites } = props;

  return (
    <ul>
      {sites.map(({ name, domain }) => {
        const link = `https://${domain}`;

        return ( // Assume name is unique.
          <li key={name}>
            {capitalize(name)}:{' '}
            <a
              href={link}
              onClick={event => {
                event.preventDefault();
                tabs.create({ url: link });
              }}
            >
              {link}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

class Popup extends Component {
  state = {
    fetchedAt: null,
    sites: null,
    error: null,
  };

  async _fetchData() {
    const {
      fetchedAt,
      sites,
      error,
    } = await storage.get();

    let newState = {};

    if (error) {
      newState.error = `Error: (${(new Date(fetchedAt)).toLocaleTimeString()}) ${error}`;
    } else {
      newState = {
        fetchedAt,
        sites,
        error,
      };
    }

    this.setState(newState);
  }

  componentDidMount() {
    this._fetchData();
    // This port will be destroyed automatically when the popup is closed
    const port = runtime.connect({ name: POPUP_PORT });

    port.onMessage.addListener(() => this._fetchData());
  }

  render() {
    const {
      fetchedAt,
      sites,
      error,
    } = this.state;

    return (
      <Fragment>
        {error && (
          <div className="alert">{error}</div>
        )}
        {fetchedAt && (
          <Fragment>
            <p>
              Fetched at: {new Date(fetchedAt).toLocaleTimeString()}
            </p>
            <SiteList sites={sites} />
          </Fragment>
        )}
        {!(error || fetchedAt) && 'Fetching data...'}
      </Fragment>
    );
  }
}

class Root extends Component {
  state = {
    error: null,
  };

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    const { error } = this.state;

    return (error ? (
      <div className="alert">{error}</div>
    ) : (<Popup />));
  }
}

render(
  <Root />,
  window.document.getElementById('root'),
);
