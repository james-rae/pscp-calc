// without this import, this file doesn't end up in the build
import './css/bootstrap.min.css';
import './css/style.css';

import { buildGrid, Domb, exportGrid } from '@/internal';

// buildGrid();

const enhancer = Domb.git('cmdEnhance');
enhancer.onclick = buildGrid;

const exporter = Domb.git('cmdExport');
exporter.onclick = exportGrid;
