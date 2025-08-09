import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './projects.entity';
import type { ICreateProject } from '../types/projects';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  findAll() {
    return this.projectRepository.find();
  }

  findLatest() {
    return this.projectRepository.find({
      order: { position: 'ASC', createdAt: 'DESC' },
      take: 8,
    });
  }

  findOne(id: string) {
    return this.projectRepository.findOne({ where: { id: parseInt(id) } });
  }

  async create(
    createProjectDto: ICreateProject,
    files: Express.Multer.File[],
  ) {
    const project = this.projectRepository.create(createProjectDto);
    const savedProject = await this.projectRepository.save(project);

    if (files) {
      const projectDir = join(
        process.cwd(),
        'uploads',
        'projects',
        savedProject.id.toString(),
      );

      if (!existsSync(projectDir)) {
        mkdirSync(projectDir, { recursive: true });
      }

      const fileNames: string[] = [];

      Object.entries(files).forEach(([fieldName, file]) => {
        if (file && file.filename) {
          const oldPath = file.path || '';
          const newPath = join(projectDir, file.filename);

          try {
            renameSync(oldPath, newPath);
            fileNames.push(
              'uploads/projects/' + project.id + '/' + file.filename,
            );
          } catch (error) {
            console.error('Error moving file:', error);
          }
        } else {
          console.log(
            `File ${fieldName} is missing path or filename:`,
            file,
          );
        }
      });

      savedProject.files = fileNames;

      return this.projectRepository.save(savedProject);
    }

    return savedProject;
  }

  async update(
    id: string,
    updateProjectDto: Partial<ICreateProject>,
    files: Express.Multer.File[],
  ) {

    const existingProject = await this.projectRepository.findOne({ 
      where: { id: parseInt(id) } 
    });
    
    let currentFiles: string[] = existingProject?.files || [];

    if (files && Object.keys(files).length > 0) {
      const projectDir = join(process.cwd(), 'uploads', 'projects', id);

      if (!existsSync(projectDir)) {
        mkdirSync(projectDir, { recursive: true });
      }

      const newFileNames: string[] = [];

      Object.entries(files).forEach(([fieldName, file]) => {
        if (file && file.filename) {
          const oldPath = file.path || '';
          const newPath = join(projectDir, file.filename);

          try {
            renameSync(oldPath, newPath);
            newFileNames.push('uploads/projects/' + id + '/' + file.filename);
          } catch (error) {
            console.error('Error moving file:', error);
          }
        } else {
          console.log(
            `File ${fieldName} is missing path or filename:`,
            file,
          );
        }
      });

      updateProjectDto.files = [...currentFiles, ...newFileNames];
    }

    return this.projectRepository.update(parseInt(id), updateProjectDto);
  }

  remove(id: string) {
    return this.projectRepository.delete(parseInt(id));
  }
}
