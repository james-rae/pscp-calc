// without this import, this file doesn't end up in the build
import './css/bootstrap.min.css';
import './css/style.css';

import { buildGrid, Domb, exportGrid } from '@/internal';

// buildGrid();

const enhancer = Domb.git('cmdEnhance');
enhancer.onclick = buildGrid;

const exporter = Domb.git('cmdExport');
exporter.onclick = exportGrid;

// refresh grid if user mashes enter when inside an input box

const enterEnhancer = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
        e.preventDefault();

        buildGrid();
    }
};

const inputEnterFields = ['cpp', 'oas', 'pension', 'empStart', 'empEnd', 'salary'];

inputEnterFields.forEach(fieldId => {
    const field = Domb.git(fieldId) as HTMLInputElement;
    field.onkeyup = enterEnhancer;
});
