/**
 * Yearly Maximum Pensionable Earnings
 */
// const YMPE = 71300; // 2025

/**
 * Average Maximum Pensionable Earnings (last 5 years YMPE)
 */
const AMPE = 66580; // 2025

/**
 * CPP Max Monthly Payout
 */
const maxMonthCPP = 1433; // 2025

/**
 * OAS Max Monthly Payout
 */
const maxMonthOAS = 727; // 2025

/**
 * Federal tax bracket of minimum
 */
const fedBracket1 = 57375; // 2025

/**
 * Tax bracket calculator
 *
 * @param yearIncome Taxable income for the year
 * @param bracket1 Top of first bracket
 * @param bracket2 Top of second bracket
 * @param rate1 Tax rate of first bracket
 * @param rate2  Tax rate of second bracket
 * @param rate3  Tax rate of third bracket
 * @returns Tax owed
 */
const taxBracket = (yearIncome: number, bracket1: number, bracket2: number, rate1: number, rate2: number, rate3: number): number => {
    let tax = yearIncome * rate1;

    if (yearIncome > bracket1) {
        tax = tax + (yearIncome - bracket1) * (rate2 - rate1);
        if (yearIncome > bracket2) {
            tax = tax + (yearIncome - bracket2) * (rate3 - rate2);
        }
    }

    return tax;
};

/**
 * Income tax for Ontario resident
 *
 * @param yearIncome Taxable income for the year
 * @param age Age of that year
 * @returns Tax owed
 */
export const calcTax = (yearIncome: number, age: number): number => {
    // currently at 2025 tax year values

    const fedLowRate = 0.15;
    const ontLowRate = 0.0505;

    // fed + ontario
    const tax =
        taxBracket(yearIncome, fedBracket1, 114750, fedLowRate, 0.205, 0.26) + taxBracket(yearIncome, 52886, 105775, ontLowRate, 0.0915, 0.1116);

    // tax credits

    // PESRSONAL AMOUNT (2025)
    let canCred = 16129;
    let ontCred = 12747;

    // AGE AMOUNT
    if (age > 64) {
        // 2025 rates
        canCred += 9028 - Math.max(0, yearIncome - 45522) * fedLowRate;
        ontCred += 6223 - Math.max(0, yearIncome - 46330) * fedLowRate; // using fed low rate is correct here
    }

    // PENSION INCOME AMOUNT
    // assuming will always have > 2000 income as pensionable
    if (age > 64) {
        // 2025 rates
        canCred += 2000;
        ontCred += 1762;
    }

    const totalCredits = canCred * fedLowRate + ontCred * ontLowRate;

    // tax is what we owe minus any credits, or nothing

    return Math.max(tax - totalCredits, 0);
};

/**
 * Figures out any defer bonus on government pensions
 *
 * @param baseMonthlyAmount Montly payout if started at 65
 * @param deferPct Boost for every year deferred
 * @param deferAge Age deferring start
 * @returns Yearly payout
 */
const deferBonus = (baseMonthlyAmount: number, deferPct: number, deferAge: number): number => {
    const factor = 1 + deferPct * Math.min(5, Math.max(0, deferAge - 65));

    return baseMonthlyAmount * factor * 12;
};

/**
 * Yearly OAS payment
 *
 * @param deferAge age started (65 - 70)
 * @returns money
 */
export const calcOAS = (deferAge: number): number => {
    return deferBonus(maxMonthOAS, 0.072, deferAge);
};

/**
 * Yearly CPP payment
 * @returns money
 */
export const calcCPP = (yearsWorked: number, startAge: number): number => {
    // 7.2% per year early, 8.4% late
    // to get maximum, you need to contribute max amount for at least 39 years

    // can view statement of contribution at https://www.canada.ca/en/employment-social-development/services/my-account.html
    // check out https://retirehappy.ca/enhanced-cpp/ and http://www.holypotato.net/?p=1694

    const baseMonth = maxMonthCPP * (Math.min(yearsWorked, 40) / 40);

    if (startAge >= 65) {
        return deferBonus(baseMonth, 0.084, startAge);
    } else {
        // 1 - 0.072 = 0.928
        const factor = 0.928 * (65 - startAge);
        return baseMonth * factor * 12;
    }
};

/**
 * Penalty for retiring too early
 */
export const earlyPenalty = (yearsOfService: number, pensionStart: number, groupA: boolean): number => {
    const retirementAge = groupA ? 60 : 65;

    let penalty = 1; // as in, 100%, no penalty

    // positive case (no penalty)
    // age is retirement age
    // OR
    // you have 30+ years AND you're within 5 years of retirement
    if (!(pensionStart >= retirementAge || (yearsOfService >= 30 && pensionStart >= retirementAge - 5))) {
        let penaltyFactor: number;

        const fromRetirement = retirementAge - pensionStart;

        // test fancy case
        if (pensionStart >= retirementAge - 10 && yearsOfService >= 25) {
            const fromEarly = retirementAge - 5 - pensionStart;
            const from30 = 30 - yearsOfService;

            penaltyFactor = Math.min(fromRetirement, Math.max(fromEarly, from30));
        } else {
            penaltyFactor = fromRetirement;
        }

        penalty = 1 - penaltyFactor * 0.05;
    }

    return penalty;
};

/**
 * Bridge benefit
 * @param yearsOfService years in pension
 * @returns money
 */
export const calcBridge = (yearsOfService: number, penalty: number): number => {
    return 0.00675 * AMPE * yearsOfService * penalty;
};

/**
 * Pension payment
 *
 * @param yearsOfService years in pension
 * @returns money
 */
export const calcPension = (yearsOfService: number, avgSalary: number, penalty: number): number => {
    // aS   = average highest salary of five years in a row
    // y = years Of service up To 35
    // AMPE = average pensionable earnings
    // unreduced annual amount = (max(As, AMPE) * 0.01375 * y) + (max(aS - ampe, 0) * 0.02 * y)
    // https://www.canada.ca/en/treasury-board-secretariat/services/pension-plan/plan-information/retirement-income-sources.html

    return (Math.min(avgSalary, AMPE) * (0.01375 * yearsOfService) + Math.max(avgSalary - AMPE, 0) * (0.02 * yearsOfService)) * penalty;
};
