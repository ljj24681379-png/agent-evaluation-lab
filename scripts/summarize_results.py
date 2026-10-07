"""Print the decision-oriented comparison."""
import csv
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(name):
    with (ROOT/'data'/name).open(encoding='utf-8-sig',newline='') as f: return {r['model']:r for r in csv.DictReader(f)}
base,final=load('baseline_results.csv'),load('final_results.csv')
print('Agent Evaluation Lab — result summary\n'+'='*46)
for model in ('Qwen','Doubao','DeepSeek'):
    b,f=base[model],final[model]
    ds=float(f['end_to_end_success_rate'])-float(b['end_to_end_success_rate'])
    dt=float(f['tool_failure_rate'])-float(b['tool_failure_rate'])
    print(f"{model:<10} success {b['end_to_end_success_rate']}% → {f['end_to_end_success_rate']}% ({ds:+.1f}pp) | tool {b['tool_failure_rate']}% → {f['tool_failure_rate']}% ({dt:+.1f}pp) | P95 {f['p95_latency_seconds']}s")
best=max(final.values(),key=lambda r:float(r['end_to_end_success_rate']))
fast=min(final.values(),key=lambda r:float(r['average_latency_seconds']))
print('-'*46+f"\nBest end-to-end: {best['model']} ({best['end_to_end_success_rate']}%)\nFast mode: {fast['model']} ({fast['average_latency_seconds']}s average, {fast['p95_latency_seconds']}s P95)")
