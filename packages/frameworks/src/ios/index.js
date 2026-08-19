export class iOSAdapter {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    generate() {
        return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            // SwiftUI content
        }
    }
}

#Preview {
    ContentView()
}`;
    }
}
//# sourceMappingURL=index.js.map