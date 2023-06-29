import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import JwtAuthGuard from '../auth/guard/jwtAuth.guard';
import { SortOptionEnum } from '../../configs/constants/common';

// Service
import { ArticleService } from './article.service';

// DTO
import {
  CreateArticleDTO,
  SearchArticleDTO,
  SearchArticleForAdminDTO,
  UpdateArticleDTO,
} from './dto';
import { Visibility } from '../../entities';

@Controller('article')
@ApiTags('Article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('/articles')
  @ApiQuery({ name: 'textSearch', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'topicUrls', required: false, type: [String] })
  @ApiQuery({ name: 'sortByDate', required: false, enum: SortOptionEnum })
  async getArticles(@Query() query: SearchArticleDTO) {
    return this.articleService.getArticles(query);
  }

  @Get('/articles/:articleUrl')
  @ApiParam({
    name: 'articleUrl',
    required: true,
    type: String,
  })
  async getArticleByUrl(
    @Req() request,
    @Param('articleUrl') articleUrl: string,
  ) {
    return this.articleService.getArticleByUrl(articleUrl);
  }

  @Post('/admin/articles')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateArticleDTO })
  async createArticle(@Req() request, @Body() data: CreateArticleDTO) {
    const { user } = request;
    return this.articleService.createArticle(data, user);
  }

  @Get('/admin/articles')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'textSearch', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'topicUrls', required: false, type: [String] })
  @ApiQuery({ name: 'deleteSoft', required: false, type: Boolean })
  @ApiQuery({
    name: 'sortByDate',
    required: false,
    enum: SortOptionEnum,
    type: String,
  })
  @ApiQuery({
    name: 'visibilities',
    required: false,
    type: [String],
    enum: Visibility,
    isArray: true,
  })
  async getArticlesWithRoleAdmin(@Query() query: SearchArticleForAdminDTO) {
    console.log(query);
    return this.articleService.getArticlesForAdmin(query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/admin/articles/:articleId')
  @ApiParam({
    name: 'articleId',
    required: true,
    type: String,
  })
  @ApiBody({ type: UpdateArticleDTO })
  async updateArticle(
    @Req() request,
    @Body() data: UpdateArticleDTO,
    @Param('articleId') articleId: number,
  ) {
    const { user } = request;
    return this.articleService.updateArticle(user, articleId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/admin/articles/:articleId')
  @ApiParam({
    name: 'articleId',
    required: true,
    type: String,
  })
  async deleteArticle(@Req() request, @Param('articleId') articleId: number) {
    const { user } = request;
    return this.articleService.deleteArticle(user, articleId);
  }
}
