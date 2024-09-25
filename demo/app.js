/**
 * app.js
 *
 * Demo app using hotmap.
 *
 * Authors: nconrad
 *
 */
import Hotmap from '../src/hotmap';
import axios from 'axios';
import { getMockData } from './utils';

const SHOW_TREE = false;

document.addEventListener('DOMContentLoaded', () => {
    demo();
});

function demo() {
    let ele = document.querySelector('#chart');

    ele.innerHTML = `<br>loading...`;

    let hotmap;
    axios.get('./data/big_data_matrix.json')
        .then(res => {
            let data = res.data;
            console.log('data provided to heatmap:', data);

            if (!SHOW_TREE) {
                hotmap = pfExample({ele, data});


                return;
            }

            fetch('data/test-tree.nwk')
                .then(res => {
                    res.text().then((newick) => {
                        hotmap = pfExample({ele, data, newick});


                    });
                });
        })
        .catch((e) => {
            console.error('Error loading data:', e);
            alert(`Could not load viewer. Please contact owner.`);
        });

    // example of updating the chart
    let updateBtn = document.querySelector('.update-btn');
    if (!updateBtn) return;

    document.querySelector('.update-btn').onclick = () => {
        let data = hotmap.getState();
        // remove some rows (example)
        let rows = data.rows.slice(0, 5),
            matrix = data.matrix.slice(0, 5);

        // select 200 columns (example)
        let cols = data.cols.slice(0, 200);
        matrix = matrix.map(row => row.slice(0, 200));
        hotmap.update({rows, cols, matrix});
    };
}

function setupLabelingButtons(hotmap) {
    const enableLabelingBtn = document.getElementById('enable-labeling-btn');
    const saveLabelsBtn = document.getElementById('save-labels-btn');

    // Enable labeling mode when the button is clicked
    enableLabelingBtn.addEventListener('click', () => {
        hotmap.enableLabelingMode();
    });

    // Save the labels when the "Save Labels" button is clicked
    saveLabelsBtn.addEventListener('click', () => {
        hotmap.saveLabelsToJSON();  // Assuming save method is defined in hotmap.js
    });
}


function pfExample({ele, data, newick}) {
    let {rows, cols, matrix} = data;
    let rowMetaLabels = ['Broadcast antenna 1', 'Host', 'Agigent field data'];
    let hotmap = new Hotmap({
        ele, rows, cols, matrix,
        rowsLabel: 'Time (ms)',
        colsLabel: 'Frequency  (Hz)',
        rowMetaLabels: rowMetaLabels,
        colMetaLabels: ['Energy Density bin'],
        hideColMeta: true,
        options: {
            showVersion: true,
            maxFontSize: 14,
            rowLabelEllipsisPos: 1
        },
        color: {
            bins: ['=0', '=1', '=2', '=3', '>=4'],
            colors: ['#ffffff', '#fbe6e2', 0xffadad, 0xff6b6b, 0xff0000]
        },
        newick: newick,
        onHover: info => {
            let cs = info.rowMeta;
            return `<div><b>RF Energy:</b> ${info.yLabel}</div><br>
              <div><b>Energy Density:</b> ${info.xLabel}<div>
              <div><b>ID:</b> ${info.colMeta[0]}<div><br>
              <div><b>${rowMetaLabels[0]}:</b> ${cs && cs[0] != 'undefined' ? cs[0] : 'N/A'}</div>
              <div><b>${rowMetaLabels[1]}:</b> ${cs && cs[1] != 'undefined' ? cs[1] : 'N/A'}</div>
              <div><b>${rowMetaLabels[2]}:</b> ${cs && cs[2] != 'undefined' ? cs[2] : 'N/A'}</div><br>
              <div><b>Value:</b> ${info.value}</div>`;
        },
        onSelection: selection => {
            alert(`Selected ${selection.length} cell(s)\n\n` +
                JSON.stringify(selection, null, 4).slice(0, 10000));

            // Highlight the bounding box around selected cells
            hotmap.highlightBoundingBox(selection);
        },
        onClick: selection => {
            alert(JSON.stringify(selection, null, 4));
        }
    });

    return hotmap;
}

