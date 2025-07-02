import { Maff } from '@/internal';

// grinder

export interface YearNugget {
    age: number;
    CPP: number;
    OAS: number;
    pension: number;
    bridge: number;
    taxes: number;
    credits: number;
    gross: number;
    net: number;
    biweek: number;
}

/**
 * How far into the future we calc stuff
 */
const maxSimAge = 80;

/**
 * Date difference in years (fractional)
 */
export const yearDiff = (laterDate: Date, earlierDate: Date): number => {
    return (laterDate.getTime() - earlierDate.getTime()) / 31557600000; // 1000 * 60 * 60 * 24 * 365.25
};

/**
 * Makes a new YearNugget
 */
const noobNug = (age: number): YearNugget => {
    return {
        age,
        CPP: 0,
        OAS: 0,
        pension: 0,
        bridge: 0,
        taxes: 0,
        credits: 0,
        gross: 0,
        net: 0,
        biweek: 0
    };
};

export const grindProjection = (
    startAge: number,
    quitAge: number,
    pensionStart: number,
    cppStart: number,
    oasStart: number,
    avgSalary: number,
    groupA: boolean
): Array<YearNugget> => {
    let currAge = Math.floor(quitAge);

    const yearsOfService = Math.min(quitAge - startAge, 35);
    const cppAmt = Maff.calcCPP(quitAge - startAge, cppStart);
    const oasAmt = Maff.calcOAS(oasStart);
    const earlyPenalty = Maff.earlyPenalty(yearsOfService, pensionStart, groupA);
    const bridgeAmt = Maff.calcBridge(yearsOfService, earlyPenalty);
    const pensionAmt = Maff.calcPension(yearsOfService, avgSalary, earlyPenalty);

    // iteration vars
    const results: Array<YearNugget> = [];

    for (let simAge = currAge; simAge <= maxSimAge; simAge++) {
        const nugget = noobNug(simAge);

        if (simAge >= cppStart) {
            nugget.CPP = cppAmt;
        }

        if (simAge >= pensionStart) {
            if (simAge < 65) {
                nugget.bridge = bridgeAmt;
            }
            nugget.pension = pensionAmt;
        }

        const preOasSubtotal = nugget.CPP + nugget.pension + nugget.bridge;

        if (simAge >= oasStart) {
            // starting 2022, OAS increases 10% at age 75 and up
            const oaass = oasAmt * (simAge > 74 ? 1.1 : 1);

            const theClaw = 0.15 * Math.max(0, preOasSubtotal + oaass - 93454); // 2025 limit

            nugget.OAS = Math.max(0, oaass - theClaw);
        }

        nugget.gross = nugget.OAS + preOasSubtotal;

        // subtract tax

        nugget.taxes = Maff.calcTax(nugget.gross, simAge);
        nugget.net = nugget.gross - nugget.taxes;

        nugget.biweek = nugget.net / 26;

        // add item to array
        results.push(nugget);
    }

    return results;
};
