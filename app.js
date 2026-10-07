const models = [
  ["Qwen", "默认模式", 94.4, 2.9, 3.3, 52, 92, 83.3],
  ["Doubao", "快速模式", 85.6, 7.4, 10, 43, 76, 63.3],
  ["DeepSeek", "高质量备选", 90, 4.8, 6.7, 61, 111, 73.3],
];

const tasks = [
  {id:"Task 01",name:"Word 报告生成",type:"文档生成",deliverable:"Word",difficulty:"中等",request:"生成一份 AI 搜索行业分析报告，包含市场概览、竞争格局和结论。",steps:[["任务理解","成功",false],["交付物识别：Word","成功",false],["生成报告","成功",true],["validate_artifact","通过",true],["交付","成功",false]]},
  {id:"Task 02",name:"Excel 数据汇总",type:"表格生成",deliverable:"Excel",difficulty:"困难",request:"根据销售明细生成一个包含区域汇总、趋势和 Top 商品的 Excel。",steps:[["生成 Excel","成功",true],["校验公式与结构","失败",true],["发现公式引用错误","失败",false],["定向修复公式","修复",true],["再次校验","通过",true],["交付","成功",false]]},
  {id:"Task 03",name:"HTML Dashboard",type:"交互页面",deliverable:"HTML",difficulty:"困难",request:"生成一个支持筛选的经营数据 Dashboard。",steps:[["生成 HTML","成功",true],["文件打开检查","通过",true],["交互测试","失败",true],["发现筛选按钮无效","失败",false],["修复 JavaScript","修复",true],["再次校验","通过",true],["交付","成功",false]]},
];

const cases = [
  {title:"HTML 生成成功，但按钮不可点击",cause:"产物失败",fix:"增加交互可用性校验",layer:"Generator / Validator"},
  {title:"工具参数错误，但 Agent 继续执行",cause:"工具调用失败",fix:"参数校验 + 失败阻断",layer:"Tool"},
  {title:"文件完成，但缺少第二个交付物",cause:"任务理解 / 交付物识别失败",fix:"执行前强制生成 deliverables checklist",layer:"Prompt / Product Flow"},
];

const tabs = document.querySelector("#tabs");
const panel = document.querySelector("#panel");
const rows = document.querySelector("#rows");
function showModel(index) {
  document.querySelectorAll("#tabs button").forEach((button, i) => button.classList.toggle("active", i === index));
  const m = models[index];
  panel.innerHTML = `<div><small>${m[1]}</small><br><strong>${m[2].toFixed(1)}%</strong><p>端到端成功率</p></div><div class="metrics">${[["三次全成功",m[7]],["平均耗时",m[5]],["P95",m[6]]].map(([name,value],i)=>`<div><span>${name}</span><i class="track"><i class="fill" style="width:${i ? value/120*100 : value}%"></i></i><b>${value}${i ? "s" : "%"}</b></div>`).join("")}</div>`;
}
models.forEach((m,index)=>{const button=document.createElement("button");button.textContent=m[0];button.onclick=()=>showModel(index);tabs.appendChild(button);rows.insertAdjacentHTML("beforeend",`<tr><td>${m[0]}${index===0?" · BEST":""}</td><td>${m[2].toFixed(1)}%</td><td>${m[3].toFixed(1)}%</td><td>${m[4].toFixed(1)}%</td><td>${m[5]}s</td><td>${m[6]}s</td><td>${m[7].toFixed(1)}%</td></tr>`)});
showModel(0);

const replayTabs = document.querySelector("#replay-tabs");
const replayPanel = document.querySelector("#replay-panel");
function showTask(index) {
  document.querySelectorAll("#replay-tabs button").forEach((button,i)=>button.classList.toggle("active",i===index));
  const task=tasks[index];
  replayPanel.innerHTML=`<div class="task-brief"><small>${task.id}</small><h3>${task.name}</h3><blockquote>${task.request}</blockquote><dl><div><dt>任务类型</dt><dd>${task.type}</dd></div><div><dt>交付物</dt><dd>${task.deliverable}</dd></div><div><dt>难度</dt><dd>${task.difficulty}</dd></div></dl></div><div class="timeline">${task.steps.map(([name,status,tool],i)=>`<div class="step"><i>${String(i+1).padStart(2,"0")}</i><span><b>${name}</b><small>${tool?"调用工具":"Agent 决策"}</small></span><em class="status-${status}">${status}</em></div>`).join("")}</div>`;
}
tasks.forEach((task,index)=>{const button=document.createElement("button");button.innerHTML=`<small>${task.id}</small><b>${task.name}</b><span>${task.deliverable} · ${task.difficulty}</span>`;button.onclick=()=>showTask(index);replayTabs.appendChild(button)});
showTask(0);

document.querySelector("#bad-cases").innerHTML=cases.map((item,index)=>`<article><small>CASE 0${index+1}</small><h3>${item.title}</h3><dl><div><dt>真正原因</dt><dd>${item.cause}</dd></div><div><dt>改什么</dt><dd>${item.fix}</dd></div><div><dt>改哪一层</dt><dd><b>${item.layer}</b></dd></div></dl></article>`).join("");
