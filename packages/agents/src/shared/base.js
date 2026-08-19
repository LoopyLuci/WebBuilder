// ============================================================================
// Base Agent Class — Common functionality for all agents
// ============================================================================
export class BaseAgent {
    id;
    name;
    type;
    description;
    model;
    status = 'idle';
    capabilities = [];
    tools = [];
    messageQueue = [];
    constructor(config) {
        this.id = config.id ?? `agent_${Date.now()}`;
        this.name = config.name ?? 'Agent';
        this.type = config.type ?? 'custom';
        this.description = config.description ?? '';
        this.model = config.model ?? 'claude-3.5-sonnet';
        this.capabilities = config.capabilities ?? [];
        this.tools = config.tools ?? [];
    }
    async start() {
        this.status = 'working';
    }
    async stop() {
        this.status = 'idle';
    }
    pause() {
        this.status = 'waiting';
    }
    resume() {
        this.status = 'working';
    }
    onError(error) {
        this.status = 'error';
        console.error(`[${this.name}] Error: ${error.message}`);
    }
    getStatus() {
        return { id: this.id, name: this.name, type: this.type, status: this.status };
    }
    send(message) {
        this.messageQueue.push(message);
    }
    receive() {
        return this.messageQueue.shift();
    }
}
export default BaseAgent;
//# sourceMappingURL=base.js.map