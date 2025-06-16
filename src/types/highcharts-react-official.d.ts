declare module 'highcharts-react-official' {
  import * as React from 'react';
  import { Options } from 'highcharts';

  export interface HighchartsReactProps {
    highcharts: any;
    constructorType?: string;
    options: Options;
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
    immutable?: boolean;
    updateArgs?: [boolean?, boolean?, boolean?];
    allowChartUpdate?: boolean;
    callback?: (chart: any) => void;
    ref?: React.RefObject<HighchartsReactRefObject>;
  }

  export interface HighchartsReactRefObject {
    chart: any;
  }

  const HighchartsReact: React.FC<HighchartsReactProps>;
  export default HighchartsReact;
}
