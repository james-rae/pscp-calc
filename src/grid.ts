import { Domb, Grinder } from '@/internal';

const moneyFormat = (money: number): string => {
    const rippedAbs = Math.abs(money);
    const stringMoney = money.toFixed(0);
    if (rippedAbs > 999999) {
        return stringMoney.slice(0, -6) + ',' + stringMoney.slice(-6, -3) + ',' + stringMoney.slice(-3);
    } else if (rippedAbs > 999) {
        return stringMoney.slice(0, -3) + ',' + stringMoney.slice(-3);
    } else {
        return stringMoney;
    }
};

const nomber = (key: string, int: boolean): number => {
    const box = Domb.git(key) as HTMLInputElement;

    return int ? parseInt(box.value) : parseFloat(box.value);
};

const buildGrid = function () {
    // pull values from form inputs

    const cppStart = nomber('cpp', true);
    const oasStart = nomber('oas', true);
    const pensionStart = nomber('pension', true);
    const joinAge = nomber('empStart', false);
    const quitAge = nomber('empEnd', true);
    const salary = nomber('salary', true);

    const checkboxer = Domb.git('cohortA') as HTMLInputElement;
    const groupA = checkboxer.checked;

    const gridOfMight = Domb.git('dataTable') as HTMLTableElement;

    const projection = Grinder.grindProjection(joinAge, quitAge, pensionStart, cppStart, oasStart, salary, groupA);

    // clear existing rows (except header)
    while (gridOfMight.rows.length > 1) {
        // delete last row
        gridOfMight.deleteRow(-1);
    }

    // add new rows
    projection.forEach(projYearData => {
        const newRow = gridOfMight.insertRow(-1);

        [
            projYearData.age,
            projYearData.net,
            projYearData.biweek,
            projYearData.CPP,
            projYearData.OAS,
            projYearData.pension,
            projYearData.bridge,
            projYearData.gross,
            projYearData.taxes
        ].forEach(gridNumber => {
            const cell = newRow.insertCell();
            cell.innerHTML = moneyFormat(gridNumber);
        });
    });
};

const exportGrid = () => {
    const gridOfMight = Domb.git('dataTable') as HTMLTableElement;

    let sOut = '';

    for (let i = 0, row; (row = gridOfMight.rows[i]); i++) {
        //iterate through rows
        let valArr = [];
        for (let j = 0; j < row.cells.length; j++) {
            valArr.push(row.cells[j].innerHTML.replaceAll(',', ''));
        }
        sOut += valArr.join('\t') + '\n';
    }

    navigator.clipboard.writeText(sOut);
};

export { buildGrid, exportGrid };
