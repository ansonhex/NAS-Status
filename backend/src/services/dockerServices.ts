import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  ports: string
  created: string
}

export async function getDockerStatus(): Promise<DockerContainer[]> {
  try {
    const { stdout } = await execAsync('docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"')
    
    const containers = stdout.trim().split('\n').map(line => {
      const [id, name, image, status, ports, created] = line.split('\t')
      return { id, name, image, status, ports, created }
    })

    return containers
  } catch (error) {
    console.error('Error getting Docker status:', error)
    return []
  }
}

export async function getDockerDetailStatus(): Promise<DockerContainer[]> {
  try {
    // Get basic Docker container info
    const { stdout: containerInfo } = await execAsync(
      'docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"'
    );

    const containers = containerInfo.trim().split('\n').map(line => {
      const [id, name, image, status, ports, created] = line.split('\t');
      return { id, name, image, status, ports, created, cpuUsage: '', memoryUsage: '' };
    });

    // Get resource usage for each container
    const { stdout: statsInfo } = await execAsync('docker stats --no-stream --format "{{.ID}}\t{{.CPUPerc}}\t{{.MemUsage}}"');

    // Map container stats to containers
    const statsMap = statsInfo.trim().split('\n').reduce((acc, line) => {
      const [id, cpuUsage, memoryUsage] = line.split('\t');
      acc[id] = { cpuUsage, memoryUsage };
      return acc;
    }, {} as Record<string, { cpuUsage: string; memoryUsage: string }>);

    // Combine basic info and stats
    const enrichedContainers = containers.map(container => {
      const stats = statsMap[container.id];
      return {
        ...container,
        cpuUsage: stats ? stats.cpuUsage : 'N/A',
        memoryUsage: stats ? stats.memoryUsage : 'N/A',
      };
    });

    return enrichedContainers;
  } catch (error) {
    console.error('Error getting Docker status or stats:', error);
    return [];
  }
}