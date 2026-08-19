// ============================================================================
// Android Component Library
// Real Jetpack Compose components with Material3
// ============================================================================

import type { AndroidFileChange } from '../types/index.js';

export interface AndroidComponentDefinition {
  id: string;
  name: string;
  category: 'layout' | 'input' | 'display' | 'navigation' | 'feedback' | 'screen';
  description: string;
  code: string;
  dependencies?: string[];
}

/**
 * All available Android components with full Jetpack Compose implementations
 */
export const androidComponents: AndroidComponentDefinition[] = [
  // Layout
  {
    id: 'android-scaffold',
    name: 'Scaffold',
    category: 'layout',
    description: 'Basic app structure with top bar and content',
    code: [
      '@Composable',
      'fun ScaffoldApp(',
      '    modifier: Modifier = Modifier,',
      '    topBar: @Composable () -> Unit = {},',
      '    content: @Composable (PaddingValues) -> Unit',
      ') {',
      '    Scaffold(',
      '        modifier = modifier,',
      '        topBar = topBar,',
      '        content = content',
      '    )',
      '}',
    ].join('\n'),
  },
  {
    id: 'android-button',
    name: 'Button',
    category: 'input',
    description: 'Clickable button with variants',
    code: [
      '@Composable',
      'fun AppButton(',
      '    onClick: () -> Unit,',
      '    modifier: Modifier = Modifier,',
      '    variant: ButtonVariant = ButtonVariant.Primary,',
      '    enabled: Boolean = true,',
      '    content: @Composable RowScope.() -> Unit',
      ') {',
      '    when (variant) {',
      '        ButtonVariant.Primary -> Button(onClick = onClick, modifier = modifier, enabled = enabled, content = content)',
      '        ButtonVariant.Outlined -> OutlinedButton(onClick = onClick, modifier = modifier, enabled = enabled, content = content)',
      '        ButtonVariant.TextButton -> TextButton(onClick = onClick, modifier = modifier, enabled = enabled, content = content)',
      '    }',
      '}',
      '',
      'enum class ButtonVariant { Primary, Outlined, TextButton }',
    ].join('\n'),
  },
  {
    id: 'android-text-field',
    name: 'TextField',
    category: 'input',
    description: 'Text input field with label and validation',
    code: [
      '@Composable',
      'fun AppTextField(',
      '    value: String,',
      '    onValueChange: (String) -> Unit,',
      '    modifier: Modifier = Modifier,',
      '    label: String? = null,',
      '    placeholder: String? = null,',
      '    isError: Boolean = false,',
      '    supportingText: String? = null,',
      '    singleLine: Boolean = true',
      ') {',
      '    OutlinedTextField(',
      '        value = value,',
      '        onValueChange = onValueChange,',
      '        modifier = modifier,',
      '        label = label?.let { { Text(it) } },',
      '        placeholder = placeholder?.let { { Text(it) } },',
      '        isError = isError,',
      '        supportingText = supportingText?.let { { Text(it) } },',
      '        singleLine = singleLine',
      '    )',
      '}',
    ].join('\n'),
  },
  {
    id: 'android-text',
    name: 'Text',
    category: 'display',
    description: 'Styled text display',
    code: [
      '@Composable',
      'fun AppText(',
      '    text: String,',
      '    modifier: Modifier = Modifier,',
      '    style: TextStyle = MaterialTheme.typography.bodyMedium,',
      '    color: Color = Color.Unspecified,',
      '    textAlign: TextAlign? = null,',
      '    maxLines: Int = Int.MAX_VALUE,',
      '    overflow: TextOverflow = TextOverflow.Clip',
      ') {',
      '    androidx.compose.material3.Text(',
      '        text = text,',
      '        modifier = modifier,',
      '        style = style,',
      '        color = color,',
      '        textAlign = textAlign,',
      '        maxLines = maxLines,',
      '        overflow = overflow',
      '    )',
      '}',
    ].join('\n'),
  },
  {
    id: 'android-card',
    name: 'Card',
    category: 'display',
    description: 'Material3 card container',
    code: [
      '@Composable',
      'fun AppCard(',
      '    modifier: Modifier = Modifier,',
      '    elevation: CardElevation = CardDefaults.cardElevation(),',
      '    shape: Shape = CardDefaults.cardShape,',
      '    content: @Composable ColumnScope.() -> Unit',
      ') {',
      '    androidx.compose.material3.Card(',
      '        modifier = modifier,',
      '        elevation = elevation,',
      '        shape = shape',
      '    ) {',
      '        Column(content = content)',
      '    }',
      '}',
    ].join('\n'),
  },
  {
    id: 'android-image',
    name: 'Image',
    category: 'display',
    description: 'Image display with Coil',
    code: [
      '@Composable',
      'fun AppImage(',
      '    painter: Painter,',
      '    contentDescription: String?,',
      '    modifier: Modifier = Modifier,',
      '    contentScale: ContentScale = ContentScale.Fit',
      ') {',
      '    androidx.compose.foundation.Image(',
      '        painter = painter,',
      '        contentDescription = contentDescription,',
      '        modifier = modifier,',
      '        contentScale = contentScale',
      '    )',
      '}',
    ].join('\n'),
    dependencies: ['io.coil-kt:coil-compose:2.6.0'],
  },
  {
    id: 'android-top-app-bar',
    name: 'TopAppBar',
    category: 'navigation',
    description: 'Top app bar with title and actions',
    code: [
      '@Composable',
      'fun AppTopBar(',
      '    title: String,',
      '    modifier: Modifier = Modifier,',
      '    navigationIcon: @Composable (() -> Unit)? = null,',
      '    actions: @Composable RowScope.() -> Unit = {}',
      ') {',
      '    androidx.compose.material3.TopAppBar(',
      '        title = { Text(title) },',
      '        modifier = modifier,',
      '        navigationIcon = navigationIcon ?: {},',
      '        actions = actions',
      '    )',
      '}',
    ].join('\n'),
  },
  {
    id: 'android-bottom-nav',
    name: 'BottomNavigation',
    category: 'navigation',
    description: 'Bottom navigation bar',
    code: [
      '@Composable',
      'fun AppBottomNav(',
      '    selectedIndex: Int,',
      '    onSelected: (Int) -> Unit,',
      '    items: List<NavItem>,',
      '    modifier: Modifier = Modifier',
      ') {',
      '    NavigationBar(modifier = modifier) {',
      '        items.forEachIndexed { index, item ->',
      '            NavigationBarItem(',
      '                icon = { Icon(item.icon, contentDescription = item.label) },',
      '                label = { Text(item.label) },',
      '                selected = selectedIndex == index,',
      '                onClick = { onSelected(index) }',
      '            )',
      '        }',
      '    }',
      '}',
      '',
      'data class NavItem(val label: String, val icon: ImageVector)',
    ].join('\n'),
  },
  {
    id: 'android-fab',
    name: 'FloatingActionButton',
    category: 'navigation',
    description: 'Floating action button',
    code: [
      '@Composable',
      'fun AppFab(',
      '    onClick: () -> Unit,',
      '    modifier: Modifier = Modifier,',
      '    icon: ImageVector,',
      '    contentDescription: String? = null',
      ') {',
      '    SmallFloatingActionButton(onClick = onClick, modifier = modifier) {',
      '        Icon(icon, contentDescription = contentDescription)',
      '    }',
      '}',
    ].join('\n'),
  },
  {
    id: 'android-alert-dialog',
    name: 'AlertDialog',
    category: 'feedback',
    description: 'Alert dialog with actions',
    code: [
      '@Composable',
      'fun AppAlertDialog(',
      '    visible: Boolean,',
      '    onDismiss: () -> Unit,',
      '    title: String,',
      '    text: String,',
      '    confirmText: String = "OK",',
      '    dismissText: String = "Cancel",',
      '    onConfirm: () -> Unit',
      ') {',
      '    if (visible) {',
      '        AlertDialog(',
      '            onDismissRequest = onDismiss,',
      '            title = { Text(title) },',
      '            text = { Text(text) },',
      '            confirmButton = { TextButton(onClick = onConfirm) { Text(confirmText) } },',
      '            dismissButton = { TextButton(onClick = onDismiss) { Text(dismissText) } }',
      '        )',
      '    }',
      '}',
    ].join('\n'),
  },
];

/**
 * Generate Android component files
 */
export function generateAndroidComponents(
  componentIds: string[],
  packageName: string
): AndroidFileChange[] {
  const files: AndroidFileChange[] = [];
  const packagePath = packageName.replace(/\./g, '/');

  const components = componentIds
    .map(id => androidComponents.find(c => c.id === id))
    .filter((c): c is AndroidComponentDefinition => c !== undefined);

  for (const component of components) {
    files.push({
      path: 'app/src/main/java/' + packagePath + '/ui/components/' + component.name + '.kt',
      content: 'package ' + packageName + '.ui.components\n\n' + component.code + '\n',
      action: 'create',
    });
  }

  files.push({
    path: 'app/src/main/java/' + packagePath + '/ui/theme/Theme.kt',
    content: [
      'package ' + packageName + '.ui.theme',
      '',
      'import android.os.Build',
      'import androidx.compose.foundation.isSystemInDarkTheme',
      'import androidx.compose.material3.MaterialTheme',
      'import androidx.compose.material3.darkColorScheme',
      'import androidx.compose.material3.dynamicDarkColorScheme',
      'import androidx.compose.material3.dynamicLightColorScheme',
      'import androidx.compose.material3.lightColorScheme',
      'import androidx.compose.runtime.Composable',
      'import androidx.compose.ui.platform.LocalContext',
      '',
      'private val LightColorScheme = lightColorScheme()',
      'private val DarkColorScheme = darkColorScheme()',
      '',
      '@Composable',
      'fun AppTheme(',
      '    darkTheme: Boolean = isSystemInDarkTheme(),',
      '    dynamicColor: Boolean = true,',
      '    content: @Composable () -> Unit',
      ') {',
      '    val colorScheme = when {',
      '        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {',
      '            val context = LocalContext.current',
      '            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)',
      '        }',
      '        darkTheme -> DarkColorScheme',
      '        else -> LightColorScheme',
      '    }',
      '',
      '    MaterialTheme(',
      '        colorScheme = colorScheme,',
      '        content = content',
      '    )',
      '}',
    ].join('\n'),
    action: 'create',
  });

  return files;
}

/**
 * Get all component IDs
 */
export function getAllAndroidComponentIds(): string[] {
  return androidComponents.map(c => c.id);
}

export default androidComponents;
