export type Project = null | {
  id: string;
  name: string;
  path: string;
};

export interface ProjectEventFunction {
  (
    id: string, //Project id (guid)
    name: string, //Project name
    path: string, //Project path
    project?: Project //Project instance
  ): void;
}
