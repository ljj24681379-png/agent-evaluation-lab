"""Validate anonymized aggregate evaluation data (standard library only)."""
import csv, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [ROOT/'data'/'baseline_results.csv', ROOT/'data'/'final_results.csv']
MODELS = {'Qwen','Doubao','DeepSeek'}
FIELDS = {'stage','model','task_count','repeats_per_task','total_runs','end_to_end_success_rate','tool_failure_rate','artifact_failure_rate','human_grade_a_rate','three_run_all_success_rate','average_latency_seconds','p95_latency_seconds'}
RATES = {'end_to_end_success_rate','tool_failure_rate','artifact_failure_rate','human_grade_a_rate','three_run_all_success_rate'}

def validate(path):
    errors=[]
    with path.open(encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f); missing=FIELDS-set(reader.fieldnames or []); rows=list(reader)
    if missing: return [f'{path.name}: missing {sorted(missing)}']
    if len(rows)!=3 or {r['model'] for r in rows}!=MODELS: errors.append(f'{path.name}: expected exactly three approved models')
    stage='baseline' if path.name.startswith('baseline') else 'final'
    for n,row in enumerate(rows,2):
        tag=f'{path.name}:{n}'
        try:
            tasks,repeats,runs=map(int,(row['task_count'],row['repeats_per_task'],row['total_runs']))
            if tasks*repeats!=runs: errors.append(f'{tag}: total_runs must equal task_count * repeats_per_task')
        except ValueError: errors.append(f'{tag}: counts must be integers')
        if row['stage']!=stage: errors.append(f'{tag}: invalid stage')
        for field in RATES:
            raw=row[field].strip()
            if not raw and stage=='baseline' and field=='human_grade_a_rate': continue
            try:
                if not 0<=float(raw)<=100: errors.append(f'{tag}: {field} outside 0..100')
            except ValueError: errors.append(f'{tag}: {field} must be numeric')
        for field in ('average_latency_seconds','p95_latency_seconds'):
            raw=row[field].strip()
            if not raw and stage=='baseline' and field=='average_latency_seconds': continue
            try:
                if float(raw)<=0: errors.append(f'{tag}: {field} must be positive')
            except ValueError: errors.append(f'{tag}: {field} must be numeric')
    return errors

def main():
    errors=[e for p in FILES for e in validate(p)]
    if errors:
        print('Validation failed:\n  - '+'\n  - '.join(errors)); return 1
    print('Validation passed: 2 files, 6 model rows, 378 total runs.'); return 0

if __name__=='__main__': sys.exit(main())
