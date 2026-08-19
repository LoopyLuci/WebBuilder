import { describe, it, expect } from 'vitest';
import {
  DesignerAgent,
  DeveloperAgent,
  TesterAgent,
  OptimizerAgent,
  DeployerAgent,
  type DesignerAgentConfig,
  type DeveloperAgentConfig,
  type TesterAgentConfig,
  type OptimizerAgentConfig,
  type DeployerAgentConfig,
} from '../../dist/index.js';

describe('DesignerAgent', () => {
  describe('creation', () => {
    it('should create with default values', () => {
      const agent = new DesignerAgent();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Designer Agent');
      expect(agent.type).toBe('designer');
      expect(agent.description).toBe('Generates design systems, themes, and color palettes');
      expect(agent.model).toBe('claude-3.5-sonnet');
      expect(agent.status).toBe('idle');
    });

    it('should have default designer capabilities', () => {
      const agent = new DesignerAgent();
      expect(agent.capabilities).toContain('design-system');
      expect(agent.capabilities).toContain('color-palette');
      expect(agent.capabilities).toContain('typography');
      expect(agent.capabilities).toContain('responsive');
    });

    it('should have default designer tools', () => {
      const agent = new DesignerAgent();
      expect(agent.tools).toContain('design-generator');
      expect(agent.tools).toContain('theme-creator');
      expect(agent.tools).toContain('color-analyzer');
    });

    it('should accept custom config', () => {
      const config: DesignerAgentConfig = {
        name: 'Custom Designer',
        capabilities: ['custom-cap'],
        tools: ['custom-tool'],
      };
      const agent = new DesignerAgent(config);
      expect(agent.name).toBe('Custom Designer');
      expect(agent.capabilities).toContain('custom-cap');
      expect(agent.tools).toContain('custom-tool');
      // Should also keep defaults
      expect(agent.capabilities).toContain('design-system');
      expect(agent.tools).toContain('design-generator');
    });
  });

  describe('executeTask', () => {
    it('should execute a generic design task', async () => {
      const agent = new DesignerAgent();
      const result = await agent.executeTask({ type: 'style-page' });
      expect(result.success).toBe(true);
      expect(result.output).toContain('style-page');
    });

    it('should execute create-design-system task', async () => {
      const agent = new DesignerAgent();
      const result = await agent.executeTask({ type: 'create-design-system' });
      expect(result.success).toBe(true);
      expect(result.output).toBe('Design system created');
    });

    it('should execute generate-palette task', async () => {
      const agent = new DesignerAgent();
      const result = await agent.executeTask({ type: 'generate-palette' });
      expect(result.success).toBe(true);
      expect(result.output).toBe('Color palette generated');
    });
  });
});

describe('DeveloperAgent', () => {
  describe('creation', () => {
    it('should create with default values', () => {
      const agent = new DeveloperAgent();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Developer Agent');
      expect(agent.type).toBe('developer');
      expect(agent.description).toBe('Implements components, features, and APIs');
    });

    it('should have default developer capabilities', () => {
      const agent = new DeveloperAgent();
      expect(agent.capabilities).toContain('component-implementation');
      expect(agent.capabilities).toContain('api-development');
      expect(agent.capabilities).toContain('testing');
      expect(agent.capabilities).toContain('refactoring');
    });

    it('should have default developer tools', () => {
      const agent = new DeveloperAgent();
      expect(agent.tools).toContain('code-generator');
      expect(agent.tools).toContain('api-builder');
      expect(agent.tools).toContain('test-writer');
    });

    it('should accept custom config', () => {
      const config: DeveloperAgentConfig = {
        name: 'Custom Developer',
        capabilities: ['debugging'],
        tools: ['debugger'],
      };
      const agent = new DeveloperAgent(config);
      expect(agent.name).toBe('Custom Developer');
      expect(agent.capabilities).toContain('debugging');
      expect(agent.tools).toContain('debugger');
    });
  });

  describe('executeTask', () => {
    it('should execute a development task', async () => {
      const agent = new DeveloperAgent();
      const result = await agent.executeTask({ type: 'build-component' });
      expect(result.success).toBe(true);
      expect(result.output).toContain('build-component');
    });
  });
});

describe('TesterAgent', () => {
  describe('creation', () => {
    it('should create with default values', () => {
      const agent = new TesterAgent();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Tester Agent');
      expect(agent.type).toBe('tester');
      expect(agent.description).toBe('Generates and runs tests for quality assurance');
    });

    it('should have default tester capabilities', () => {
      const agent = new TesterAgent();
      expect(agent.capabilities).toContain('unit-testing');
      expect(agent.capabilities).toContain('integration-testing');
      expect(agent.capabilities).toContain('e2e-testing');
      expect(agent.capabilities).toContain('visual-testing');
      expect(agent.capabilities).toContain('a11y-testing');
    });

    it('should have default tester tools', () => {
      const agent = new TesterAgent();
      expect(agent.tools).toContain('test-generator');
      expect(agent.tools).toContain('test-runner');
      expect(agent.tools).toContain('coverage-analyzer');
    });

    it('should accept custom config', () => {
      const config: TesterAgentConfig = {
        name: 'QA Engineer',
        capabilities: ['security-testing'],
        tools: ['security-scanner'],
      };
      const agent = new TesterAgent(config);
      expect(agent.name).toBe('QA Engineer');
      expect(agent.capabilities).toContain('security-testing');
      expect(agent.tools).toContain('security-scanner');
    });
  });

  describe('executeTask', () => {
    it('should execute a test task', async () => {
      const agent = new TesterAgent();
      const result = await agent.executeTask({ type: 'run-tests' });
      expect(result.success).toBe(true);
      expect(result.output).toContain('run-tests');
    });
  });
});

describe('OptimizerAgent', () => {
  describe('creation', () => {
    it('should create with default values', () => {
      const agent = new OptimizerAgent();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Optimizer Agent');
      expect(agent.type).toBe('optimizer');
      expect(agent.description).toBe('Handles performance, accessibility, and SEO optimization');
    });

    it('should have default optimizer capabilities', () => {
      const agent = new OptimizerAgent();
      expect(agent.capabilities).toContain('performance-optimization');
      expect(agent.capabilities).toContain('accessibility-audit');
      expect(agent.capabilities).toContain('seo-optimization');
    });

    it('should have default optimizer tools', () => {
      const agent = new OptimizerAgent();
      expect(agent.tools).toContain('lighthouse');
      expect(agent.tools).toContain('axe');
      expect(agent.tools).toContain('bundle-analyzer');
    });

    it('should accept custom config', () => {
      const config: OptimizerAgentConfig = {
        name: 'Performance Expert',
        capabilities: ['image-optimization'],
        tools: ['image-compressor'],
      };
      const agent = new OptimizerAgent(config);
      expect(agent.name).toBe('Performance Expert');
      expect(agent.capabilities).toContain('image-optimization');
      expect(agent.tools).toContain('image-compressor');
    });
  });

  describe('executeTask', () => {
    it('should execute an optimization task', async () => {
      const agent = new OptimizerAgent();
      const result = await agent.executeTask({ type: 'optimize-performance' });
      expect(result.success).toBe(true);
      expect(result.output).toContain('optimize-performance');
    });
  });
});

describe('DeployerAgent', () => {
  describe('creation', () => {
    it('should create with default values', () => {
      const agent = new DeployerAgent();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Deployer Agent');
      expect(agent.type).toBe('deployer');
      expect(agent.description).toBe('Handles deployment operations');
    });

    it('should have default deployer capabilities', () => {
      const agent = new DeployerAgent();
      expect(agent.capabilities).toContain('deployment');
      expect(agent.capabilities).toContain('rollback');
      expect(agent.capabilities).toContain('preview-deployment');
    });

    it('should have default deployer tools', () => {
      const agent = new DeployerAgent();
      expect(agent.tools).toContain('deploy-cli');
      expect(agent.tools).toContain('vercel-api');
      expect(agent.tools).toContain('netlify-api');
    });

    it('should accept custom config', () => {
      const config: DeployerAgentConfig = {
        name: 'DevOps Engineer',
        capabilities: ['kubernetes-deploy'],
        tools: ['kubectl'],
      };
      const agent = new DeployerAgent(config);
      expect(agent.name).toBe('DevOps Engineer');
      expect(agent.capabilities).toContain('kubernetes-deploy');
      expect(agent.tools).toContain('kubectl');
    });
  });

  describe('executeTask', () => {
    it('should execute a deploy task', async () => {
      const agent = new DeployerAgent();
      const result = await agent.executeTask({ type: 'deploy' });
      expect(result.success).toBe(true);
      expect(result.output).toContain('deploy');
    });
  });
});