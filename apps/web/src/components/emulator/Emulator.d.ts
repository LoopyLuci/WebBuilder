import React from 'react';
import { devicePresets } from '@webbuilder/android';
interface EmulatorProps {
    projectName?: string;
    packageName?: string;
    components?: string[];
    defaultDevice?: typeof devicePresets[0];
}
export declare function Emulator({ projectName, packageName, components, defaultDevice }: EmulatorProps): React.JSX.Element;
export default Emulator;
//# sourceMappingURL=Emulator.d.ts.map