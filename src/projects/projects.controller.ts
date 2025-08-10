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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverImage', maxCount: 1 }, 
        { name: 'files', maxCount: 20 }
      ],
      multerConfig,
    ),
  )
  create(
    @Request() req,
    @UploadedFiles() uploadedFiles: { 
      coverImage?: Express.Multer.File[], 
      files?: Express.Multer.File[] 
    },
  ) {
    const createProjectDto: ICreateProject = {
      title: req.body.title,
      description: req.body.description,
      technologies: req.body.technologies
        ? JSON.parse(req.body.technologies)
        : [],
      url: req.body.url,
      position: req.body.position ? parseInt(req.body.position) : 0,
      coverImage: '',
      files: [],
    };

    const coverImage = uploadedFiles?.coverImage?.[0];
    const files = uploadedFiles?.files || [];

    return this.projectsService.create(
      createProjectDto,
      coverImage,
      files,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverImage', maxCount: 1 }, 
        { name: 'files', maxCount: 20 }
      ],
      multerConfig,
    ),
  )
  update(
    @Request() req,
    @Param('id') id: string,
    @UploadedFiles() uploadedFiles: { 
      coverImage?: Express.Multer.File[], 
      files?: Express.Multer.File[] 
    },
  ) {
    const updateProjectDto: Partial<ICreateProject> = {
      title: req.body.title,
      description: req.body.description,
      technologies: req.body.technologies
        ? JSON.parse(req.body.technologies)
        : [],
      url: req.body.url,
      position: req.body.position ? parseInt(req.body.position) : 0,
      coverImage: '',
      files: req.body.files,
    };

    const coverImage = uploadedFiles?.coverImage?.[0];
    const files = uploadedFiles?.files || [];

    return this.projectsService.update(
      id,
      updateProjectDto,
      coverImage,
      files,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
