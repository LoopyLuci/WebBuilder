export interface iOSAdapterConfig {
  swiftUI?: boolean;
  uiKit?: boolean;
  iosVersion?: string;
}

export class iOSAdapter {
  constructor(private config: iOSAdapterConfig = {}) {}

  generate(): string {
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
