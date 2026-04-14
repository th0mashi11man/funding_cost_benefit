import { useState, useEffect, Fragment } from 'react';
import { calculateFinancials, Config, Scheme, CalculationInputs, fmt } from './logic/math';
import { t, Language } from './logic/i18n';

function parsePrefillNumber(value: string | null): number | null {
    if (!value) {
        return null;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getPrefillParams() {
    if (typeof window === 'undefined') {
        return {
            schemeId: null as string | null,
            requestedAmount: null as number | null,
            projectYears: null as number | null
        };
    }

    const params = new URLSearchParams(window.location.search);
    return {
        schemeId: params.get('scheme'),
        requestedAmount: parsePrefillNumber(params.get('requestedAmount')),
        projectYears: parsePrefillNumber(params.get('projectYears'))
    };
}

export default function App() {
    const [lang, setLang] = useState<Language>('en');
    const [config, setConfig] = useState<Config | null>(null);
    const [activeScheme, setActiveScheme] = useState<Scheme | null>(null);
    const [inputs, setInputs] = useState<CalculationInputs>({
        requestedAmount: 0,
        projectYears: 4,
        staffFTE: 1,
        plannedSalaryDirect: 0,
        existingSalaries: 0,
        servicePurchases: 0,
        funderMode: 'percent_overhead',
        funderValue: 0
    });
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('./config.json')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                const prefill = getPrefillParams();
                const defaultS =
                    data.schemes.find((s: Scheme) => s.id === prefill.schemeId) ||
                    data.schemes.find((s: Scheme) => s.id === data.defaultScheme) ||
                    data.schemes[0];
                setActiveScheme(defaultS);
                setInputs(prev => ({
                    ...prev,
                    requestedAmount: prefill.requestedAmount ?? prev.requestedAmount,
                    projectYears: prefill.projectYears ?? prev.projectYears
                }));
            })
            .catch(err => {
                console.error('Failed to load config', err);
                setError('Could not load configuration. Using local defaults.');
            });
    }, []);

    const handleCalculate = () => {
        if (!activeScheme || !config) return;
        const res = calculateFinancials(
            inputs,
            activeScheme,
            config.overhead.salary_percent / 100,
            config.overhead.other_percent / 100
        );
        setResults(res);
    };

    const handleReset = () => {
        setInputs({
            requestedAmount: 0,
            projectYears: 4,
            staffFTE: 1,
            plannedSalaryDirect: 0,
            existingSalaries: 0,
            servicePurchases: 0,
            funderMode: 'percent_overhead',
            funderValue: 0
        });
        setResults(null);
    };

    if (!config && !error) return <div className="wrap">Loading...</div>;

    return (
        <div className="wrap">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h1 style={{ margin: 0 }}>{t(lang, 'appTitle')}</h1>
                <button className="secondary" onClick={() => setLang(lang === 'en' ? 'sv' : 'en')} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    {t(lang, 'langToggle')}
                </button>
            </div>

            <div className="section">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong>Overhead policy: </strong>
                        <span className="pill">
                            {config?.overhead.label}: salary {config?.overhead.salary_percent}%, other {config?.overhead.other_percent}%
                        </span>
                    </div>
                    {error && <div className="pill error">{error}</div>}
                </div>
            </div>

            <div className="section">
                <label htmlFor="schemeSelect">{t(lang, 'section1Title')}</label>
                <select
                    id="schemeSelect"
                    value={activeScheme?.id || ''}
                    onChange={(e) => setActiveScheme(config?.schemes.find(s => s.id === e.target.value) || null)}
                >
                    <option value="" disabled>{t(lang, 'selectSchemePlaceholder')}</option>
                    {config?.schemes.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <div className="help" style={{ marginTop: '8px' }}>
                    <SchemeDescription scheme={activeScheme} lang={lang} />
                </div>
            </div>

            {activeScheme && (
                <>
                    <div className="section">
                        <strong>{t(lang, 'section2Title')}</strong>
                        <div className="grid cols-2" style={{ marginTop: '10px' }}>
                            <div>
                                <label>{t(lang, 'amountAppliedIT')}</label>
                                <NumericInput
                                    value={inputs.requestedAmount}
                                    onChange={v => setInputs(prev => ({ ...prev, requestedAmount: v }))}
                                />
                            </div>
                            <div>
                                <label>{t(lang, 'projectDuration')}</label>
                                <NumericInput
                                    value={inputs.projectYears}
                                    onChange={v => setInputs(prev => ({ ...prev, projectYears: v }))}
                                />
                            </div>
                            {(activeScheme.id === 'rj_programme' || activeScheme.id === 'rj_project') && (
                                <div>
                                    <label>{t(lang, 'numberPositions')}</label>
                                    <NumericInput
                                        value={inputs.staffFTE}
                                        isDecimal
                                        onChange={v => setInputs(prev => ({ ...prev, staffFTE: v }))}
                                    />
                                </div>
                            )}
                        </div>

                        {activeScheme.id === 'other' && (
                            <div className="grid cols-2" style={{ marginTop: '10px' }}>
                                <div>
                                    <label>{t(lang, 'funderCoverageMode')}</label>
                                    <select
                                        value={inputs.funderMode}
                                        onChange={e => setInputs(prev => ({ ...prev, funderMode: e.target.value as any }))}
                                    >
                                        <option value="percent_overhead">{t(lang, 'pctOverhead')}</option>
                                        <option value="absolute">{t(lang, 'fixedAmount')}</option>
                                        <option value="percent_total">{t(lang, 'pctTotal')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label>{t(lang, 'value')}</label>
                                    <NumericInput
                                        value={inputs.funderValue || 0}
                                        isDecimal={inputs.funderMode !== 'absolute'}
                                        onChange={v => setInputs(prev => ({ ...prev, funderValue: v }))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="section">
                        <strong>{t(lang, 'section3Title')}</strong>
                        <div className="grid cols-2" style={{ marginTop: '10px' }}>
                            <div>
                                <label>{t(lang, 'plannedSalary')}</label>
                                <NumericInput
                                    value={inputs.plannedSalaryDirect}
                                    onChange={v => setInputs(prev => ({ ...prev, plannedSalaryDirect: v }))}
                                />
                            </div>
                            <div>
                                <label>{t(lang, 'existingSalary')}</label>
                                <NumericInput
                                    value={inputs.existingSalaries}
                                    onChange={v => setInputs(prev => ({ ...prev, existingSalaries: v }))}
                                />
                            </div>
                            {activeScheme.id === 'horizon' && (
                                <div>
                                    <label>{t(lang, 'servicePurchases')}</label>
                                    <NumericInput
                                        value={inputs.servicePurchases}
                                        onChange={v => setInputs(prev => ({ ...prev, servicePurchases: v }))}
                                    />
                                </div>
                            )}
                        </div>
                        {config && (() => {
                            const liveRes = calculateFinancials(
                                inputs,
                                activeScheme,
                                config.overhead.salary_percent / 100,
                                config.overhead.other_percent / 100
                            );
                            if (liveRes.otherDirect > 0) {
                                return (
                                    <div className="help" style={{ marginTop: '12px' }}>
                                        <span className="pill">
                                            <span className="legend-key l-other"></span>
                                            {fmt(liveRes.otherDirect)} {t(lang, 'otherDirectDesc')}
                                        </span>
                                    </div>
                                );
                            } else if (liveRes.otherDirect === 0 && inputs.requestedAmount > 0) {
                                return (
                                    <div className="help" style={{ marginTop: '12px' }}>
                                        <span className="pill" style={{ color: 'var(--warn)', borderColor: 'var(--warn)' }}>
                                            No budget remaining for other direct costs
                                        </span>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    <div className="section">
                        <div className="row" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={handleCalculate}>{t(lang, 'calculateBtn')}</button>
                            <button className="secondary" onClick={handleReset}>{t(lang, 'resetBtn')}</button>
                        </div>

                        {results && <Results results={results} lang={lang} />}
                    </div>
                </>
            )}

            <div className="footer">
                <div>{t(lang, 'verifyNote')}</div>
            </div>
        </div>
    );
}

function NumericInput({ value, onChange, isDecimal = false }: { value: number, onChange: (v: number) => void, isDecimal?: boolean }) {
    const [displayValue, setDisplayValue] = useState(value === 0 ? '' : fmt(value));

    useEffect(() => {
        setDisplayValue(value === 0 ? '' : fmt(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\s/g, '').replace(',', '.');
        if (raw === '' || raw === '.') {
            setDisplayValue(e.target.value);
            onChange(0);
            return;
        }
        const n = parseFloat(raw);
        if (!isNaN(n)) {
            onChange(n);
            setDisplayValue(e.target.value);
        }
    };

    const handleBlur = () => {
        setDisplayValue(value === 0 ? '' : fmt(value));
    };

    return (
        <input
            type="text"
            inputMode={isDecimal ? "decimal" : "numeric"}
            className="mono"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
}

function Results({ results, lang }: { results: any, lang: Language }) {
    const { userSalaries, coFinNetTotal, funderBenefit, otherDirect, newSalaries, ufApplied, ufByName, deptOver } = results;

    const isOk = userSalaries > coFinNetTotal;
    const isWarn = userSalaries === coFinNetTotal;

    const tagCls = isOk ? 'ok' : (isWarn ? 'warn' : 'bad');
    const tagText = isOk ? t(lang, 'verdictClearOk') : (isWarn ? t(lang, 'verdictBreakEven') : t(lang, 'verdictUnclear'));

    // Clamp values for chart presentation exactly as index.old.html did
    const usedOverhead = Math.min(deptOver, funderBenefit);
    const clampedUserSalaries = Math.min(userSalaries, results.plannedSal);

    // Breakdown for Legend and Bar
    const segments = [
        { label: t(lang, 'legOverheadCovered'), value: usedOverhead, colorClass: 'over', legendClass: 'l-over' },
        { label: t(lang, 'legOtherDirect'), value: otherDirect, colorClass: 'other', legendClass: 'l-other' },
        { label: t(lang, 'legExistingSalaries'), value: clampedUserSalaries, colorClass: 'salary', legendClass: 'l-salary' },
        { label: t(lang, 'legNewSalaries'), value: newSalaries, colorClass: 'new-salary', legendClass: 'l-new-salary' },
        ...Object.entries(ufByName).map(([name, val]) => ({
            label: name,
            value: val as number,
            colorClass: name.toLowerCase().includes('university') ? 'uni' : 'fac',
            legendClass: name.toLowerCase().includes('university') ? 'l-uni' : 'l-fac'
        })),
        { label: t(lang, 'legDeptCoFinancing'), value: coFinNetTotal, colorClass: 'cofin', legendClass: 'l-cofin' }
    ].filter(s => s.value > 0);

    const total = segments.reduce((sum, s) => sum + s.value, 0);

    return (
        <div className="section result-section" style={{ marginTop: '24px' }}>
            <div className="row" style={{ alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{t(lang, 'analysisResults')}</h2>
                <div className={`tag ${tagCls}`}>{tagText}</div>
            </div>
            <p className="help" style={{ margin: '0 0 16px' }}>
                {t(lang, 'verdictDesc', { existing: fmt(userSalaries), cofin: fmt(coFinNetTotal) })}
            </p>

            <div className="bar-wrap">
                <div className="bar">
                    {segments.map((s, i) => (
                        <span
                            key={i}
                            className={s.colorClass}
                            style={{ flex: s.value / total }}
                            title={`${s.label}: ${fmt(s.value)}`}
                        >
                            {fmt(s.value)}
                        </span>
                    ))}
                </div>
                <div className="legend">
                    {segments.map((s, i) => (
                        <span key={i} className="pill">
                            <span className={`legend-key ${s.legendClass}`}></span>
                            {s.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="details-grid cols-3" style={{ marginTop: '20px' }}>
                <div className="result-card">
                    <div className="section-title">{t(lang, 'card1Title')}</div>
                    <div className="kv">
                        <div className="k">{t(lang, 'costs')}</div><div className="v mono">{fmt(results.deptOver)}</div>
                        <div style={{ gridColumn: '1 / -1', height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                        <div className="k">{t(lang, 'funderCoverage')}</div><div className="v mono">{fmt(results.funderBenefit)}</div>
                        {Object.entries(results.ufByName).length > 0 ? (
                            Object.entries(results.ufByName).map(([name, val]) => (
                                <Fragment key={name}>
                                    <div className="k">{name} {t(lang, 'supportSuffix')}</div><div className="v mono">{fmt(val as number)}</div>
                                </Fragment>
                            ))
                        ) : (
                            <Fragment>
                                <div className="k">{t(lang, 'internalSupport')}</div><div className="v mono">{fmt(results.ufApplied)}</div>
                            </Fragment>
                        )}
                    </div>
                </div>
                <div className="result-card">
                    <div className="section-title">{t(lang, 'card2Title')}</div>
                    <div className="kv">
                        <div className="k">{t(lang, 'otherDirectCosts')}</div><div className="v mono">{fmt(results.otherDirect)}</div>
                        <div className="k">{t(lang, 'salaryExistingStaff')}</div><div className="v mono">{fmt(results.userSalaries)}</div>
                        {results.deptService > 0 && (
                            <><div className="k">{t(lang, 'servicePurchases')}</div><div className="v mono">{fmt(results.deptService)}</div></>
                        )}
                    </div>
                </div>
                <div className="result-card">
                    <div className="section-title">{t(lang, 'card3Title')}</div>
                    <div className="kv">
                        <div className="k">{t(lang, 'coFinancingNeeded')}</div><div className="v mono">{fmt(results.coFinNetTotal)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SchemeDescription({ scheme, lang }: { scheme: Scheme | null, lang: Language }) {
    if (!scheme) {
        return <p style={{ margin: 0 }}>{t(lang, 'helpSelectScheme')}</p>;
    }

    const uniLines: string[] = [];
    const facLines: string[] = [];
    const otherLines: string[] = [];

    if (scheme.uf_rules) {
        scheme.uf_rules.forEach(r => {
            if (r.mode === 'per_fte_per_year') return;

            const name = (r.name || '').toLowerCase();
            const note = r.notes || '';

            if (/rektor|university|vice|vc/.test(name)) {
                uniLines.push(note || t(lang, 'defaultCoFundingNote'));
            } else if (/faculty/.test(name)) {
                facLines.push(note || t(lang, 'defaultCoFundingNote'));
            } else if (note) {
                otherLines.push(`${r.name ? r.name + ': ' : ''}${note}`);
            }
        });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {scheme.funder?.label && (
                <div><strong>{t(lang, 'funder')}</strong> {scheme.funder.label}</div>
            )}

            {uniLines.length > 0 && (
                <div><strong>{t(lang, 'uniCoFunding')}</strong> {uniLines.join(' ')}</div>
            )}
            {facLines.length > 0 && (
                <div><strong>{t(lang, 'facCoFunding')}</strong> {facLines.join(' ')}</div>
            )}
            {otherLines.length > 0 && (
                <div><strong>{t(lang, 'otherCoFunding')}</strong> {otherLines.join(' ')}</div>
            )}

            {scheme.id === 'horizon' && (
                <div><strong>{t(lang, 'specialRule')}</strong> {t(lang, 'horizonRule')}</div>
            )}
            {(scheme.id === 'rj_programme' || scheme.id === 'rj_project') && (
                <div><strong>{t(lang, 'specialRule')}</strong> {t(lang, 'rjRule')}</div>
            )}
        </div>
    );
}
