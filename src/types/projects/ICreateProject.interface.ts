export interface ICreateProject {
  title: string;
  description: string;
  technologies: string[];
  url: string;
  position: number;
  files?: string[];
}