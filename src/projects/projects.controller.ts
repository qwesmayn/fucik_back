import { multerConfig } from '../config/multer.config';
import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { ICreateProject } from '../types/projects';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/core/auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('latest')
  findLatest() {
    return this.projectsService.findLatest();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post('create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', undefined, multerConfig))
  create(
    @Request() req,
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    const createProjectDto: ICreateProject = {
      title: req.body.title,
      description: req.body.description,
      technologies: req.body.technologies
        ? JSON.parse(req.body.technologies)
        : [],
      url: req.body.url,
      position: req.body.position,
      files: [],
    };

    return this.projectsService.create(
      createProjectDto,
      files as Express.Multer.File[],
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', undefined, multerConfig))
  update(
    @Request() req,
    @Param('id') id: string,
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    const updateProjectDto: Partial<ICreateProject> = {
      title: req.body.title,
      description: req.body.description,
      technologies: req.body.technologies
        ? JSON.parse(req.body.technologies)
        : [],
      url: req.body.url,
      position: req.body.position,
      files: req.body.files,
    };

    return this.projectsService.update(
      id,
      updateProjectDto,
      files as Express.Multer.File[],
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
