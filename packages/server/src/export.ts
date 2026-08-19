// ============================================================================
// Export Module — Generate deployment configs for all environments
// ============================================================================

export interface ExportOptions {
  projectDir: string;
  projectName: string;
  environments: ('local' | 'docker' | 'kubernetes' | 'vercel' | 'netlify' | 'cloudflare')[];
}

export interface ExportResult {
  success: boolean;
  files: string[];
  instructions: string[];
}

/**
 * Export project for deployment to any environment
 */
export async function exportProject(options: ExportOptions): Promise<ExportResult> {
  const { projectDir, projectName, environments } = options;
  const files: string[] = [];
  const instructions: string[] = [];

  for (const env of environments) {
    switch (env) {
      case 'local':
        files.push(...exportLocal(projectDir, projectName));
        instructions.push('Run: npm install && npm run dev');
        break;
      case 'docker':
        files.push(...exportDocker(projectDir, projectName));
        instructions.push('Run: docker-compose up -d');
        break;
      case 'kubernetes':
        files.push(...exportKubernetes(projectDir, projectName));
        instructions.push('Run: kubectl apply -f deploy/kubernetes/');
        break;
      case 'vercel':
        files.push(...exportVercel(projectDir, projectName));
        instructions.push('Run: vercel --prod');
        break;
      case 'netlify':
        files.push(...exportNetlify(projectDir, projectName));
        instructions.push('Run: netlify deploy --prod');
        break;
      case 'cloudflare':
        files.push(...exportCloudflare(projectDir, projectName));
        instructions.push('Run: wrangler deploy');
        break;
    }
  }

  return { success: true, files, instructions };
}

function exportLocal(projectDir: string, projectName: string): string[] {
  // Local development - just needs package.json scripts
  return [
    `${projectDir}/.env.local`,
    `${projectDir}/.env.local.example`,
  ];
}

function exportDocker(projectDir: string, projectName: string): string[] {
  return [
    `${projectDir}/Dockerfile`,
    `${projectDir}/docker-compose.yml`,
    `${projectDir}/.dockerignore`,
    `${projectDir}/nginx.conf`,
  ];
}

function exportKubernetes(projectDir: string, projectName: string): string[] {
  return [
    `${projectDir}/deploy/kubernetes/deployment.yml`,
    `${projectDir}/deploy/kubernetes/service.yml`,
    `${projectDir}/deploy/kubernetes/ingress.yml`,
    `${projectDir}/deploy/kubernetes/configmap.yml`,
  ];
}

function exportVercel(projectDir: string, projectName: string): string[] {
  return [
    `${projectDir}/vercel.json`,
  ];
}

function exportNetlify(projectDir: string, projectName: string): string[] {
  return [
    `${projectDir}/netlify.toml`,
    `${projectDir}/_redirects`,
  ];
}

function exportCloudflare(projectDir: string, projectName: string): string[] {
  return [
    `${projectDir}/wrangler.toml`,
    `${projectDir}/.cloudflare/worker.js`,
  ];
}

export default { exportProject };
