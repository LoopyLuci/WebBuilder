export interface FlutterAdapterConfig {
  material3?: boolean;
  cupertino?: boolean;
  nullSafety?: boolean;
}

export class FlutterAdapter {
  constructor(private config: FlutterAdapterConfig = {}) {}

  generate(): string {
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
