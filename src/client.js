import {HistoryLocation, run} from 'react-router';
import {render} from 'react-transmit';
import routes from 'views/Routes';

const reactRoot = document.getElementById('app');

run(routes, HistoryLocation, Handler => render(Handler, {}, reactRoot));

if (process.env.NODE_ENV !== 'production') {
  if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes ||
      !reactRoot.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}
