import fetch from 'node-fetch';
import fs from 'fs';

const token = process.env.CF_API_TOKEN;
const accountId = process.env.CF_ACCOUNT_ID;
const headers = { Authorization: `Bearer ${token}` };
const keepCount = 3;
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const cleanup = async (project) => {
  const baseURL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/deployments`;
  console.log(`\n📥 [${project}] 获取部署列表中...`);

  const res = await fetch(baseURL, { headers });
  const data = await res.json();

  if (!data.success) {
    console.warn(`❌ [${project}] 请求失败：${data.errors?.[0]?.message || '未知错误'}`);
    return;
  }

  const deployments = data.result;
  if (!deployments || deployments.length <= keepCount) {
    console.log(`✅ [${project}] 部署数不足，无需清理。`);
    return;
  }

  const toDelete = deployments
    .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
    .slice(keepCount)
    .filter(d => d.latest_stage?.status !== 'ACTIVE');

  for (const d of toDelete) {
    const url = `${baseURL}/${d.id}`;
    console.log(`🗑 [${project}] 删除部署：${d.id}`);
    const res = await fetch(url, { method: 'DELETE', headers });
    const del = await res.json();
    if (del.success) {
      console.log(`✅ 删除成功：${d.id}`);
    } else {
      console.warn(`⚠️ 删除失败：${d.id}，原因：${del.errors?.[0]?.message || '未知'}`);
    }
    await sleep(800);
  }
};

const projects = JSON.parse(fs.readFileSync('./projects.json', 'utf-8'));
(async () => {
  for (const project of projects) {
    await cleanup(project);
  }
})();
