export class FlutterAdapter {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    generate() {
        return `import 'package:flutter/material.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Text('Hello Flutter'),
        ),
      ),
    );
  }
}`;
    }
}
//# sourceMappingURL=index.js.map