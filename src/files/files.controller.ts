import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/filefilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService) {}

  @Get('product/:imageName')
  @ApiResponse({type: File})
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName)
    
    res.sendFile(path)
  }

  @Post('product')
  @ApiResponse({type: URL})
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File){
   
    if(!file){
      throw new BadRequestException('make sure the file is an image')
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return secureUrl
  }
  
}
