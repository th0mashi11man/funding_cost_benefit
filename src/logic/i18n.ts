export type Language = 'en' | 'sv';

export const translations: Record<Language, Record<string, string>> = {
    en: {
        // App Header & Layout
        appTitle: 'Applied IT Research Funding Financial Cost-Benefit Calculator',
        verifyNote: 'NB: This tool is for illustrative purposes only. Always verify with a financial officer before submitting applications.',
        calculateBtn: 'Calculate',
        resetBtn: 'Reset',
        langToggle: 'Svenska',

        // Section 1: Scheme Selection
        section1Title: '1. Select grant scheme',
        selectSchemePlaceholder: 'Select grant scheme…',
        helpSelectScheme: 'Start by choosing the grant scheme. If it isn\'t listed, choose Other.',

        // Scheme Description
        funder: 'Funder:',
        uniCoFunding: 'University co-funding:',
        facCoFunding: 'Faculty co-funding:',
        otherCoFunding: 'Other internal co-funding:',
        specialRule: 'Special rule:',
        horizonRule: 'All indirect costs on service purchases must be covered by the department.',
        rjRule: '170tkr per FTE and year is added on top of the RJ grant amount.',
        defaultCoFundingNote: 'Contributes to covering part of the overhead costs.',

        // Section 2: Project parameters
        section2Title: '2. Project parameters & funder coverage',
        amountAppliedIT: 'Amount for Applied IT',
        projectDuration: 'Project duration (years)',
        numberPositions: 'Number of positions (FTE)',
        funderCoverageMode: 'Funder coverage mode',
        pctOverhead: '% of overhead',
        fixedAmount: 'Fixed amount',
        pctTotal: '% of total',
        value: 'Value',

        // Section 3: Direct cost allocation
        section3Title: '3. Direct cost allocation',
        plannedSalary: 'Planned salary costs',
        existingSalary: '…of which existing staff',
        servicePurchases: 'Service purchases',
        availableDirectDesc: 'available for direct costs',
        otherDirectDesc: 'available for other direct costs',

        // Results Section
        analysisResults: 'Analysis Results',
        verdictClearOk: 'CLEAR cost-benefit advantage',
        verdictBreakEven: 'BREAK-EVEN',
        verdictUnclear: 'UNCLEAR cost-benefit advantage',
        verdictDesc: 'Coverage of existing-salary costs ({existing}) vs departmental co-financing ({cofin}).',

        // Result Cards
        card1Title: 'Indirect costs & coverage',
        costs: 'Costs',
        funderCoverage: 'Funder coverage',
        internalSupport: 'Internal support',
        supportSuffix: 'support',

        card2Title: 'Direct costs',
        otherDirectCosts: 'Other direct costs',
        salaryExistingStaff: 'Salary for existing staff',

        card3Title: 'Departmental contribution',
        coFinancingNeeded: 'Co-financing needed',

        // Chart Legend
        legOverheadCovered: 'Overhead covered',
        legOtherDirect: 'Other direct costs',
        legExistingSalaries: 'Existing salaries',
        legNewSalaries: 'New salaries',
        legDeptCoFinancing: 'Dept co-financing'
    },
    sv: {
        // App Header & Layout
        appTitle: 'Tillämpad IT Kostnads-nyttoanalys för extern finansiering',
        verifyNote: 'OBS: Detta verktyg är endast till för illustrativa syften. Stäm alltid av med en ekonom innan du skickar in ansökningar.',
        calculateBtn: 'Beräkna',
        resetBtn: 'Återställ',
        langToggle: 'English',

        // Section 1: Scheme Selection
        section1Title: '1. Välj bidragsform',
        selectSchemePlaceholder: 'Välj bidragsform…',
        helpSelectScheme: 'Börja med att välja bidragsform. Om den inte finns med, välj "Övriga".',

        // Scheme Description
        funder: 'Finansiär:',
        uniCoFunding: 'Medfinansiering universitet:',
        facCoFunding: 'Medfinansiering fakultet:',
        otherCoFunding: 'Annan intern samfinansiering:',
        specialRule: 'Särskild regel:',
        horizonRule: 'Alla indirekta kostnader på tjänsteköp måste täckas av institutionen.',
        rjRule: '170 tkr per heltidsekvivalent och år läggs till utöver RJ-bidragsbeloppet.',
        defaultCoFundingNote: 'Bidrar till att täcka en del av overhead-kostnaderna.',

        // Section 2: Project parameters
        section2Title: '2. Projektparametrar & finansiärens täckning',
        amountAppliedIT: 'Belopp för Tillämpad IT',
        projectDuration: 'Projekttid (år)',
        numberPositions: 'Antal befattningar (FTE)',
        funderCoverageMode: 'Täckningsmodell finansiär',
        pctOverhead: '% av overhead',
        fixedAmount: 'Fast belopp',
        pctTotal: '% av totalen',
        value: 'Värde',

        // Section 3: Direct cost allocation
        section3Title: '3. Fördelning av direkta kostnader',
        plannedSalary: 'Planerade lönekostnader',
        existingSalary: '…varav låner för befintlig personal',
        servicePurchases: 'Tjänsteköp',
        availableDirectDesc: 'tillgängligt för direkta kostnader',
        otherDirectDesc: 'tillgängligt för övriga direkta kostnader',

        // Results Section
        analysisResults: 'Analysresultat',
        verdictClearOk: 'TYDLIG kostnads-nyttofördel',
        verdictBreakEven: 'JÄMNT UPP',
        verdictUnclear: 'OKLAR kostnads-nyttofördel',
        verdictDesc: 'Täckning av befintliga lönekostnader ({existing}) jämfört med institutionens medfinansiering ({cofin}).',

        // Result Cards
        card1Title: 'Indirekta kostnader & täckning',
        costs: 'Kostnader',
        funderCoverage: 'Finansiärens täckning',
        internalSupport: 'Internt stöd',
        supportSuffix: 'stöd',

        card2Title: 'Direkta kostnader',
        otherDirectCosts: 'Övriga direkta kostnader',
        salaryExistingStaff: 'Löner för befintlig personal',

        card3Title: 'Institutionens bidrag',
        coFinancingNeeded: 'Medfinansieringsbehov',

        // Chart Legend
        legOverheadCovered: 'Överhead täckt',
        legOtherDirect: 'Övriga direkta kost',
        legExistingSalaries: 'Befintliga löner',
        legNewSalaries: 'Nya löner',
        legDeptCoFinancing: 'Inst. medfinansiering'
    }
};

export function t(lang: Language, key: string, params?: Record<string, string>): string {
    let str = translations[lang]?.[key] || translations['en'][key] || key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.replace(`{${k}}`, v);
        }
    }
    return str;
}
