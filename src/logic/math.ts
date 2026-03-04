export interface FunderConfig {
    mode: 'percent_overhead' | 'percent_total' | 'absolute' | 'manual' | 'none';
    value: number | null;
    label: string;
}

export interface UfRule {
    name: string;
    mode: 'fixed' | 'fixed_per_year' | 'percent_total' | 'percent_overhead' | 'percent_total_capped_per_year' | 'per_fte_per_year' | 'oh_gap_share';
    value?: number;
    amount?: number;
    amount_per_year?: number;
    per_year_cap?: number;
    notes?: string;
}

export interface Scheme {
    id: string;
    name: string;
    funder: FunderConfig;
    uf_rules: UfRule[];
}

export interface Config {
    title: string;
    overhead: {
        label: string;
        salary_percent: number;
        other_percent: number;
    };
    defaultScheme: string;
    schemes: Scheme[];
}

export interface CalculationInputs {
    requestedAmount: number;
    projectYears: number;
    staffFTE: number;
    plannedSalaryDirect: number;
    existingSalaries: number;
    servicePurchases: number;
    funderMode?: 'percent_overhead' | 'absolute' | 'percent_total';
    funderValue?: number;
}

export const RJ_TOPUP_PER_FTE_YEAR = 170000;

export const fmt = (n: number) => (isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }).replace(/,/g, ' ') : '—');

export function calculateFinancials(
    inputs: CalculationInputs,
    activeScheme: Scheme,
    salaryOH: number,
    otherOH: number
) {
    const { requestedAmount, projectYears, staffFTE, servicePurchases, plannedSalaryDirect, existingSalaries } = inputs;

    // RJ top-up logic
    const schemesNeedingFTE = new Set(['rj_programme', 'rj_project']);
    let bonus = 0;
    if (schemesNeedingFTE.has(activeScheme.id)) {
        bonus = Math.max(0, Math.round(RJ_TOPUP_PER_FTE_YEAR * staffFTE * projectYears));
    }
    const effectiveTotal = requestedAmount + bonus;

    // Funder coverage calculation
    const getFunderCoverage = (total: number, deptOver: number) => {
        const funder = activeScheme.funder;
        const mode = funder.mode === 'manual' ? inputs.funderMode : funder.mode;
        const value = funder.mode === 'manual' ? inputs.funderValue || 0 : funder.value || 0;

        let cov = 0;
        if (mode === 'percent_overhead') {
            cov = Math.round(deptOver * Math.max(0, Math.min(value, 100)) / 100);
        } else if (mode === 'percent_total') {
            const dec = Math.max(0, Math.min(value, 500)) / 100;
            cov = Math.round(total * (dec / (1 + dec)));
        } else if (mode === 'absolute') {
            cov = Math.max(0, Math.min(Math.round(value), total));
        }

        return cov + bonus;
    };

    // Cascading OH / Direct split (from current index.html logic)
    let lastShare = 0.5;
    let deptOver = 0;
    let direct = 0;

    for (let i = 0; i < 3; i++) {
        const rEff = salaryOH * lastShare + otherOH * (1 - lastShare);
        deptOver = Math.round(effectiveTotal * (rEff / (1 + rEff)));
        const fundCov = getFunderCoverage(effectiveTotal, deptOver);
        const used = Math.min(deptOver, fundCov);
        direct = Math.max(0, effectiveTotal - used);
        lastShare = direct > 0 ? Math.max(0, Math.min(plannedSalaryDirect / direct, 1)) : 0;
    }

    // UF Rules engine
    const computeUfAmount = (rule: UfRule, total: number, years: number, deptOver: number, coFinRaw: number) => {
        const yrs = Math.max(1, Math.round(years));
        if (!rule.mode) return 0;

        switch (rule.mode) {
            case 'fixed': return Math.max(0, Math.round(rule.amount || 0));
            case 'fixed_per_year': return Math.max(0, Math.round((rule.amount_per_year || 0) * yrs));
            case 'percent_total': return Math.max(0, Math.round(total * (rule.value || 0) / 100));
            case 'percent_overhead': return Math.max(0, Math.round(deptOver * (rule.value || 0) / 100));
            case 'percent_total_capped_per_year':
                const raw = total * (rule.value || 0) / 100;
                return Math.max(0, Math.round(Math.min(raw, (rule.per_year_cap || 0) * yrs)));
            case 'oh_gap_share':
                return Math.max(0, Math.round(coFinRaw * (rule.value || 0) / 100));
            default: return 0;
        }
    };

    const sumUfAmount = (rules: UfRule[], total: number, years: number, deptOver: number, coFinRaw: number) => {
        let sum = 0;
        const byName: Record<string, number> = {};
        rules.forEach(r => {
            if (r.mode === 'per_fte_per_year') return;
            const a = computeUfAmount(r, total, years, deptOver, coFinRaw);
            sum += a;
            if (r.name) byName[r.name] = (byName[r.name] || 0) + a;
        });
        return { amount: sum, byName };
    };

    // High level components
    let funderBenefit = 0;
    let coFinRaw = 0;
    let ufAgg, ufApplied, ufByNameScaled, coFinNetOH;
    let deptService = 0;

    if (activeScheme.id === 'horizon') {
        const serviceOH = Math.round(servicePurchases * (otherOH / (1 + otherOH)));
        deptService = serviceOH;
        const nonServiceOver = Math.max(0, deptOver - serviceOH);
        funderBenefit = getFunderCoverage(effectiveTotal, nonServiceOver);
        const coveredNonService = Math.min(nonServiceOver, funderBenefit);
        coFinRaw = Math.max(0, nonServiceOver - coveredNonService);
        ufAgg = sumUfAmount(activeScheme.uf_rules, requestedAmount, projectYears, nonServiceOver, coFinRaw);
        ufApplied = Math.min(ufAgg.amount, coFinRaw);
        coFinNetOH = Math.max(0, coFinRaw - ufApplied);
        funderBenefit = coveredNonService;
    } else {
        funderBenefit = getFunderCoverage(effectiveTotal, deptOver);
        const covered = Math.min(deptOver, funderBenefit);
        coFinRaw = Math.max(0, deptOver - covered);
        ufAgg = sumUfAmount(activeScheme.uf_rules, requestedAmount, projectYears, deptOver, coFinRaw);
        ufApplied = Math.min(ufAgg.amount, coFinRaw);
        coFinNetOH = Math.max(0, coFinRaw - ufApplied);
        funderBenefit = covered;
    }

    // Scale UF by name
    const scale = ufAgg.amount > 0 ? (ufApplied / ufAgg.amount) : 0;
    ufByNameScaled = Object.fromEntries(
        Object.entries(ufAgg.byName).map(([name, val]) => [name, Math.round(val * scale)])
    );

    const coFinNetTotal = coFinNetOH + deptService;
    const otherDirect = Math.max(0, direct - plannedSalaryDirect);

    return {
        effectiveTotal,
        rjTopup: bonus,
        deptOver,
        funderBenefit,
        direct,
        plannedSal: plannedSalaryDirect,
        otherDirect,
        userSalaries: existingSalaries,
        newSalaries: Math.max(0, plannedSalaryDirect - existingSalaries),
        ufApplied,
        ufByName: ufByNameScaled,
        coFinNetOH,
        deptService,
        coFinNetTotal
    };
}
