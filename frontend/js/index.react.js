import app from './routes';
import {render} from './IsomorphicClient';
import '../less/chart.less';
import '../less/work.less';
import '../less/signup.less';

window.startApp = () => {
    render(app, document.getElementById('app'));
};
