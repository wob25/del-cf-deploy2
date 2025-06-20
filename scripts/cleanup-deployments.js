import fetch from 'node-fetch';

// --- 配置项 ---
const token = process.env.CF_API_TOKEN;
const accountId = process.env.CF_ACCOUNT_ID;
const headers = { Authorization: `Bearer ${token}` };
const keepCount = 3; // 保留最新的部署数量
const perPage = 25;  // 每次 API 请求获取的数量

// --- 工具函数 ---
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * 获取账户下所有的 Pages 项目名称（自动处理分页）
 * @returns {Promise<string[]|null>} 返回项目名称数组，如果出错则返回 null
 */
const getAllProjectNames = async () => {
  const allProjects = [];
  let page = 1;
  console.log("🌐 开始获取账户下的所有 Pages 项目...");

  while (true) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects?page=${page}&per_page=${perPage}`;
    
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!data.success) {
        console.warn(`❌ 获取项目列表第 ${page} 页时请求失败: ${data.errors?.[0]?.message || '未知错误'}`);
        return null;
      }
      
      const projectsOnPage = data.result;
      if (!projectsOnPage || projectsOnPage.length === 0) {
        console.log(`✅ 已成功获取所有项目。`);
        break;
      }

      allProjects.push(...projectsOnPage);
      page++;
      await sleep(500);
    } catch (error) {
      console.error(`❌ 获取项目列表时发生网络错误: ${error.message}`);
      return null;
    }
  }
  return allProjects.map(p => p.name); // 我们只需要项目的名称
};


/**
 * 获取单个项目的所有部署记录（自动处理分页）
 * @param {string} project - 项目名称
 * @returns {Promise<Array|null>} 返回部署记录数组，如果出错则返回 null
 */
const getAllDeployments = async (project) => {
  const allDeployments = [];
  let page = 1;
  console.log(`[${project}] 开始获取所有部署记录...`);

  while (true) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/deployments?page=${page}&per_page=${perPage}&sort_by=created_on&sort_order=desc`;
    console.log(`[${project}] 正在获取第 ${page} 页...`);
    
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!data.success) {
        console.warn(`❌ [${project}] 获取第 ${page} 页时请求失败: ${data.errors?.[0]?.message || '未知错误'}`);
        return null;
      }
      
      const deploymentsOnPage = data.result;
      if (!deploymentsOnPage || deploymentsOnPage.length === 0) {
        break;
      }

      allDeployments.push(...deploymentsOnPage);
      page++;
      await sleep(500);
    } catch (error) {
      console.error(`❌ [${project}] 获取部署时发生网络错误: ${error.message}`);
      return null;
    }
  }
  console.log(`✅ [${project}] 已获取所有部署记录。`);
  return allDeployments;
};

/**
 * 清理单个项目的旧部署
 * @param {string} project - 项目名称
 */
const cleanupProject = async (project) => {
  console.log(`\n🚀 [${project}] 开始执行清理任务...`);
  
  const deployments = await getAllDeployments(project);

  if (deployments === null) {
    console.error(`[${project}] 由于获取数据失败，跳过清理。`);
    return;
  }
  
  console.log(`[${project}] 共获取到 ${deployments.length} 条部署记录。`);

  if (deployments.length <= keepCount) {
    console.log(`✅ [${project}] 部署数量不足 ${keepCount} 条，无需清理。`);
    return;
  }

  const toDelete = deployments.slice(keepCount).filter(d => 
    d.latest_stage?.status.toLowerCase() !== 'active' && d.deployment_trigger.type !== 'production'
  );

  if (toDelete.length === 0) {
    console.log(`✅ [${project}] 没有可删除的旧部署。`);
    return;
  }

  console.log(`[${project}] 计划删除 ${toDelete.length} 条旧部署...`);
  
  const deleteBaseURL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/deployments`;
  for (const d of toDelete) {
    const url = `${deleteBaseURL}/${d.id}`;
    console.log(`🗑 [${project}] 正在删除部署: ${d.id.substring(0, 8)}... (创建于: ${d.created_on})`);
    
    try {
      const res = await fetch(url, { method: 'DELETE', headers });
      if (res.ok) {
        console.log(`✅ [${project}] 删除成功: ${d.id.substring(0, 8)}...`);
      } else {
        const del = await res.json();
        console.warn(`⚠️ [${project}] 删除失败: ${d.id.substring(0, 8)}...，原因：${del.errors?.[0]?.message || res.statusText}`);
      }
    } catch (error) {
      console.error(`❌ [${project}] 删除部署时发生网络错误: ${error.message}`);
    }
    await sleep(800);
  }
};

/**
 * 主函数
 */
const main = async () => {
  if (!token || !accountId) {
    console.error("❌ 环境变量 CF_API_TOKEN 或 CF_ACCOUNT_ID 未设置，脚本无法运行。");
    process.exit(1);
  }

  const projectNames = await getAllProjectNames();

  if (projectNames === null || projectNames.length === 0) {
    console.log("🤷 未能获取到任何项目，或没有项目需要清理。脚本结束。");
    return;
  }

  console.log(`\n🔍 发现 ${projectNames.length} 个项目将要进行清理: ${projectNames.join(', ')}`);
  
  for (const project of projectNames) {
    await cleanupProject(project);
  }
  
  console.log("\n🎉 所有项目的清理任务已执行完毕！");
};

main();
