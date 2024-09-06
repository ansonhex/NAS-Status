import { Hono } from 'hono';
import { getCPUStatus } from './services/cpuServices';
import { getRAMStatus } from './services/ramServices';
import { getDockerDetailStatus, getDockerStatus } from './services/dockerServices';
import NodeCache from 'node-cache';

const app = new Hono();
const cache = new NodeCache({ stdTTL: 10 });

app.get('/', (c) => {
  return c.text('NAS Status API');
});

app.get('/status/cpu', async (c) => {
  const cachedCPU = cache.get('cpuStatus');
  if (cachedCPU) {
    return c.json(cachedCPU);
  }

  const cpuStatus = await getCPUStatus();
  cache.set('cpuStatus', cpuStatus);
  return c.json(cpuStatus);
});

app.get('/status/ram', async (c) => {
  const cachedRAM = cache.get('ramStatus');
  if (cachedRAM) {
    return c.json(cachedRAM);
  }

  const ramStatus = await getRAMStatus();
  cache.set('ramStatus', ramStatus);
  return c.json(ramStatus);
});

app.get('/status/docker', async (c) => {
  const cachedDocker = cache.get('dockerStatus');
  if (cachedDocker) {
    return c.json(cachedDocker);
  }

  const dockerServices = await getDockerStatus();
  cache.set('dockerStatus', dockerServices); 
  return c.json(dockerServices);
});

app.get('/status/docker/details', async (c) => {
  const cachedDockerDetail = cache.get('dockerDetailStatus');
  if (cachedDockerDetail) {
    return c.json(cachedDockerDetail);
  }

  const dockerDetailServices = await getDockerDetailStatus();
  cache.set('dockerDetailStatus', dockerDetailServices);
  return c.json(dockerDetailServices);
});

export default app;
