export interface Config {
  rootPath: string;
  publicPath: string;
  manifestName: string;
  buildPath: string;
  packagePath: string;
}

export interface TaskArgs extends Config {
  manifestPath: string;
  linkDir: string | undefined;
  manifest: any;
  log: (...args: any[]) => void;
  synchronise: (
    srcDirPath: string,
    destDirPath: string,
    log: (...args: any[]) => void,
  ) => void;
}

export type TaskFunction = ((args: TaskArgs) => void | Promise<void>) & {
  description?: string;
};

export interface BootArgs {
  config: Config;
  commands: TaskFunction[];
}

/**
 * A dumb manifest type
 */
export type Manifest = {
  id: string;
};

export type FoundryConfig = {
  dataPath: string;
  url?: string;
};
